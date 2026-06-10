import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const ebook = await req.json();
  const dataPath = join(tmpdir(), `ebook_${Date.now()}.json`);
  const outPath  = join(tmpdir(), `ebook_${Date.now()}.pdf`);
  await writeFile(dataPath, JSON.stringify(ebook), "utf8");

  const script = `
# -*- coding: utf-8 -*-
import json, os, requests, tempfile
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
import reportlab

# Fuente Unicode
rl_dir = os.path.dirname(reportlab.__file__)
for name, file in [("Vera","Vera.ttf"),("VeraBd","VeraBd.ttf"),("VeraIt","VeraIt.ttf"),("VeraBI","VeraBI.ttf")]:
    p = os.path.join(rl_dir,"fonts",file)
    if os.path.exists(p): pdfmetrics.registerFont(TTFont(name,p))

FONT      = "Vera"
FONT_BOLD = "VeraBd"
FONT_IT   = "VeraIt"

with open(r"${dataPath.replace(/\\/g, "\\\\")}", encoding="utf-8") as f:
    eb = json.load(f)

OUT = r"${outPath.replace(/\\/g, "\\\\")}"
W, H = A4

# Paleta dark/purple
BG        = colors.HexColor("#090820")
PURPLE    = colors.HexColor("#7030EF")
MAGENTA   = colors.HexColor("#DB1FFF")
DARK_CARD = colors.HexColor("#12103a")
CARD2     = colors.HexColor("#1a1040")
BLANCO    = colors.white
GRIS_TEXT = colors.HexColor("#c4b5fd")
GRIS_CLARO= colors.HexColor("#1e1a4a")
BORDE     = colors.HexColor("#3a2a6a")

def st(name, **kw):
    base = dict(fontName=FONT, fontSize=10, leading=15, textColor=GRIS_TEXT)
    base.update(kw)
    return ParagraphStyle(name, **base)

titulo_cap = st("tc", fontName=FONT_BOLD, fontSize=20, leading=26, textColor=BLANCO, spaceAfter=4)
seccion_st = st("sec", fontName=FONT_BOLD, fontSize=11, textColor=MAGENTA, spaceBefore=10, spaceAfter=4)
cuerpo_st  = st("cb", leading=16, spaceAfter=4, alignment=TA_JUSTIFY)
tip_st     = st("tip", fontName=FONT_IT, textColor=PURPLE, leftIndent=12)
num_cap_st = st("nc", fontName=FONT_BOLD, fontSize=9, textColor=MAGENTA, spaceAfter=2)

# Fotos por categoria
FOTOS = [
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=700&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=80",
    "https://images.unsplash.com/photo-1473093226705-0f1aff5620f0?w=700&q=80",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=700&q=80",
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=700&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=700&q=80",
]

def get_image(idx):
    try:
        r = requests.get(FOTOS[idx % len(FOTOS)], timeout=12)
        if r.status_code == 200:
            p = os.path.join(tempfile.gettempdir(), f"ebimg_{idx}.jpg")
            open(p,"wb").write(r.content); return p
    except: pass
    return None

class GradientRect(Flowable):
    def __init__(self, w, h, c1, c2, radius=8):
        super().__init__(); self.w=w; self.h=h; self.c1=c1; self.c2=c2; self.radius=radius
    def wrap(self,*_): return self.w, self.h
    def draw(self):
        c = self.canv
        steps = 40
        for i in range(steps):
            t = i/steps
            r = self.c1.red + (self.c2.red-self.c1.red)*t
            g = self.c1.green + (self.c2.green-self.c1.green)*t
            b = self.c1.blue + (self.c2.blue-self.c1.blue)*t
            c.setFillColorRGB(r,g,b)
            c.rect(0, self.h*(1-t), self.w, self.h/steps+1, fill=1, stroke=0)

class Linea(Flowable):
    def __init__(self, w=15.5*cm, c1=None, c2=None):
        super().__init__(); self.w=w; self.c1=c1 or PURPLE; self.c2=c2 or MAGENTA
    def wrap(self,*_): return self.w, 3
    def draw(self):
        c = self.canv
        steps = 30
        for i in range(steps):
            t = i/steps
            r = self.c1.red+(self.c2.red-self.c1.red)*t
            g = self.c1.green+(self.c2.green-self.c1.green)*t
            b = self.c1.blue+(self.c2.blue-self.c1.blue)*t
            c.setStrokeColorRGB(r,g,b); c.setLineWidth(2)
            c.line(self.w*t, 1.5, self.w*(t+1/steps)+1, 1.5)

class Foto(Flowable):
    def __init__(self, path, w=15.5*cm, h=6.5*cm):
        super().__init__(); self.path=path; self.w=w; self.h=h
    def wrap(self,*_): return self.w, self.h
    def draw(self):
        c = self.canv
        # Fondo oscuro siempre
        c.setFillColor(DARK_CARD)
        c.roundRect(0,0,self.w,self.h,10,fill=1,stroke=0)
        if self.path and os.path.exists(self.path):
            try:
                c.saveState()
                p = c.beginPath()
                p.roundRect(0,0,self.w,self.h,10)
                c.clipPath(p, stroke=0)
                c.drawImage(self.path, 0, 0, width=self.w, height=self.h,
                            preserveAspectRatio=True, anchor="c", mask="auto")
                c.restoreState()
                # overlay gradient sutil
                c.setFillColor(colors.HexColor("#090820"))
                c.setFillAlpha(0.15)
                c.roundRect(0,0,self.w,self.h,10,fill=1,stroke=0)
                c.setFillAlpha(1)
                # borde purple
                c.setStrokeColor(PURPLE); c.setLineWidth(1)
                c.roundRect(0,0,self.w,self.h,10,fill=0,stroke=1)
                return
            except: pass
        c.setFillColor(GRIS_TEXT); c.setFont(FONT,9)
        c.drawCentredString(self.w/2, self.h/2, "Imagen no disponible")

capitulos = eb.get("capitulos",[])
print("Descargando imagenes...")
fotos = [get_image(i) for i in range(len(capitulos))]
print(f"Fotos: {sum(1 for f in fotos if f)}/{len(fotos)}")

doc = SimpleDocTemplate(OUT, pagesize=A4,
    leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2.2*cm)
story = []

def portada(c, d):
    # Fondo oscuro
    c.setFillColor(BG); c.rect(0,0,W,H,fill=1,stroke=0)
    # Gradiente superior
    steps=60
    for i in range(steps):
        t=i/steps
        r=PURPLE.red+(MAGENTA.red-PURPLE.red)*t
        g=PURPLE.green+(MAGENTA.green-PURPLE.green)*t
        b=PURPLE.blue+(MAGENTA.blue-PURPLE.blue)*t
        c.setFillColorRGB(r,g,b)
        c.rect(0, H-14+14*t/steps*steps, W/steps*1.1*(i+1), 14, fill=1, stroke=0)
    # banda top completa
    for i in range(steps):
        t=i/steps
        r=PURPLE.red+(MAGENTA.red-PURPLE.red)*t
        g=PURPLE.green+(MAGENTA.green-PURPLE.green)*t
        b=PURPLE.blue+(MAGENTA.blue-PURPLE.blue)*t
        c.setFillColorRGB(r,g,b)
        c.rect(W*t/steps*steps, H-14, W/steps+1, 14, fill=1, stroke=0)
    c.rect(0, 0, W, 14, fill=1, stroke=0)
    # titulo
    titulo = eb.get("titulo","EBOOK").upper()
    words = titulo.split()
    lines_t, line = [], ""
    for w2 in words:
        test=(line+" "+w2).strip()
        if c.stringWidth(test, FONT_BOLD, 30) < W-80: line=test
        else:
            if line: lines_t.append(line)
            line=w2
    if line: lines_t.append(line)
    y = H/2 + len(lines_t)*18 + 40
    for ln in lines_t:
        # sombra
        c.setFillColor(PURPLE); c.setFont(FONT_BOLD,30)
        c.drawCentredString(W/2+2, y-2, ln)
        c.setFillColor(BLANCO); c.drawCentredString(W/2, y, ln)
        y -= 38
    # linea gradiente
    for i in range(steps):
        t=i/steps
        r=PURPLE.red+(MAGENTA.red-PURPLE.red)*t
        g=PURPLE.green+(MAGENTA.green-PURPLE.green)*t
        b=PURPLE.blue+(MAGENTA.blue-PURPLE.blue)*t
        c.setStrokeColorRGB(r,g,b); c.setLineWidth(2)
        c.line(W/2-80+160*t, y+20, W/2-80+160*(t+1/steps)+2, y+20)
    # subtitulo
    c.setFont(FONT,13); c.setFillColor(GRIS_TEXT)
    c.drawCentredString(W/2, y, eb.get("subtitulo","")[:70])
    # desc
    c.setFont(FONT,10); c.setFillColor(colors.HexColor("#7a6aaa"))
    c.drawCentredString(W/2, y-20, eb.get("descripcion","")[:80])
    # badge
    n = len(capitulos)
    cx, cy = W/2, y-75
    for i in range(steps):
        t=i/steps
        r2=PURPLE.red+(MAGENTA.red-PURPLE.red)*t
        g2=PURPLE.green+(MAGENTA.green-PURPLE.green)*t
        b2=PURPLE.blue+(MAGENTA.blue-PURPLE.blue)*t
        c.setFillColorRGB(r2,g2,b2)
        c.circle(cx, cy+30*t/steps, 32, fill=1, stroke=0)
    c.setFillColor(BLANCO); c.setFont(FONT_BOLD,22)
    c.drawCentredString(cx, cy-6, str(n))
    c.setFont(FONT,7); c.drawCentredString(cx, cy-18, "CAPITULOS")

def footer(c, d):
    c.saveState()
    c.setFillColor(BG)
    c.rect(0,0,W,1.8*cm,fill=1,stroke=0)
    c.setFillColor(PURPLE); c.setFont(FONT,8)
    c.drawString(2*cm, 1.3*cm, eb.get("titulo",""))
    c.setFillColor(GRIS_TEXT)
    c.drawRightString(W-2*cm, 1.3*cm, f"Pagina {d.page}")
    steps=30
    for i in range(steps):
        t=i/steps
        r=PURPLE.red+(MAGENTA.red-PURPLE.red)*t
        g=PURPLE.green+(MAGENTA.green-PURPLE.green)*t
        b=PURPLE.blue+(MAGENTA.blue-PURPLE.blue)*t
        c.setStrokeColorRGB(r,g,b); c.setLineWidth(1)
        c.line(2*cm+(W-4*cm)*t, 1.7*cm, 2*cm+(W-4*cm)*(t+1/steps)+1, 1.7*cm)
    c.restoreState()

def bg_page(c, d):
    c.saveState()
    c.setFillColor(BG); c.rect(0,0,W,H,fill=1,stroke=0)
    c.restoreState()
    footer(c,d)

story.append(Spacer(1,2*cm)); story.append(PageBreak())

# INDICE
story.append(Paragraph("INDICE", st("idx",fontName=FONT_BOLD,fontSize=22,textColor=BLANCO,spaceAfter=6)))
story.append(Linea()); story.append(Spacer(1,0.4*cm))
rows=[["#","Capitulo"]]
for i,cap in enumerate(capitulos):
    rows.append([str(i+1), cap.get("titulo","")])
t2=Table(rows,colWidths=[1.5*cm,14*cm])
t2.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),PURPLE),("TEXTCOLOR",(0,0),(-1,0),BLANCO),
    ("FONTNAME",(0,0),(-1,0),FONT_BOLD),("FONTSIZE",(0,0),(-1,-1),10),
    ("FONTNAME",(0,1),(-1,-1),FONT),
    ("ROWBACKGROUNDS",(0,1),(-1,-1),[DARK_CARD,GRIS_CLARO]),
    ("TEXTCOLOR",(0,1),(-1,-1),GRIS_TEXT),
    ("ALIGN",(0,0),(0,-1),"CENTER"),
    ("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9),
    ("LEFTPADDING",(0,0),(-1,-1),10),
    ("GRID",(0,0),(-1,-1),0.3,BORDE),
]))
story.append(t2); story.append(PageBreak())

# CAPITULOS
for i,cap in enumerate(capitulos):
    story.append(Paragraph(f"CAPITULO {cap.get('numero',i+1):02d}", num_cap_st))
    story.append(Paragraph(cap.get("titulo",""), titulo_cap))
    story.append(Linea()); story.append(Spacer(1,0.25*cm))
    story.append(Paragraph(cap.get("descripcion",""), cuerpo_st))
    story.append(Spacer(1,0.3*cm))
    story.append(Foto(fotos[i]))
    story.append(Spacer(1,0.35*cm))
    story.append(Paragraph(cap.get("contenido",""), cuerpo_st))
    story.append(Spacer(1,0.25*cm))
    puntos=cap.get("puntos_clave",[])
    if puntos:
        story.append(Paragraph("PUNTOS CLAVE", seccion_st))
        prows=[[Paragraph(f"• {p}", st("pt",fontName=FONT,fontSize=10,leading=14,textColor=GRIS_TEXT))] for p in puntos]
        pt=Table(prows,colWidths=[15.5*cm])
        pt.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1),DARK_CARD),
            ("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),
            ("LEFTPADDING",(0,0),(-1,-1),14),
            ("ROWBACKGROUNDS",(0,0),(-1,-1),[DARK_CARD,GRIS_CLARO]),
            ("LINEAFTER",(0,0),(0,-1),3,PURPLE),
            ("GRID",(0,0),(-1,-1),0.2,BORDE),
        ]))
        story.append(pt); story.append(Spacer(1,0.25*cm))
    tip=cap.get("tip","")
    if tip:
        tip_t=Table([[Paragraph("💡  "+tip, tip_st)]],colWidths=[15.5*cm])
        tip_t.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1),GRIS_CLARO),
            ("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10),
            ("LEFTPADDING",(0,0),(-1,-1),14),
            ("LINEBEFORE",(0,0),(0,-1),3,MAGENTA),
            ("BOX",(0,0),(-1,-1),0.5,BORDE),
        ]))
        story.append(tip_t)
    story.append(PageBreak())

# CIERRE
story.append(Spacer(1,3*cm))
story.append(Paragraph("GRACIAS POR LEER ESTE EBOOK",
    st("cierre",fontName=FONT_BOLD,fontSize=18,textColor=BLANCO,alignment=TA_CENTER)))
story.append(Spacer(1,0.5*cm))
story.append(Linea())
story.append(Spacer(1,0.5*cm))
story.append(Paragraph(eb.get("descripcion",""),
    st("cb2",leading=18,alignment=TA_CENTER,fontSize=11)))

doc.build(story, onFirstPage=portada, onLaterPages=bg_page)
print("OK:"+OUT)
`;

  const scriptPath = join(tmpdir(), `gen_${Date.now()}.py`);
  await writeFile(scriptPath, script, "utf8");

  try {
    const { stdout, stderr } = await execAsync(`python "${scriptPath}"`);
    if (stderr) console.error("stderr:", stderr);
    const pdfPath = stdout.trim().split("\n").pop()!.replace("OK:", "");
    const pdfBuffer = await readFile(pdfPath);
    await Promise.all([dataPath, scriptPath, pdfPath].map(p => unlink(p).catch(() => {})));
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ebook.pdf"`,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
