export function buildHTML(c: Record<string, unknown>, titulo: string, precio: string, color: string) {
  const col = color || "#7030EF";
  const colDark = "#0d0d1a";
  const pains = (c.pains as string[]).map(p => `<div class="bi">${p.startsWith("➡") ? "" : "➡️"}<span>${p.replace("➡️", "").trim()}</span></div>`).join("\n");
  const gains = (c.gains as string[]).map(g => `<div class="bi">${g.startsWith("✅") ? "" : "✅"}<span>${g.replace("✅", "").trim()}</span></div>`).join("\n");
  const modulos = (c.modulos as Array<{num:number;emoji:string;titulo:string;items:string[]}>).map(m => `
    <div class="ma">
      <div class="mh" onclick="togMod(this)">
        <div class="mhl"><span class="mb2">${m.emoji} MÓDULO ${m.num}</span><span class="mt">${m.titulo}</span></div>
        <span class="marr">+</span>
      </div>
      <div class="mb3"><div class="mbi"><ul>${m.items.map(i => `<li>${i}</li>`).join("")}</ul></div></div>
    </div>`).join("\n");
  const bonos = (c.bonos as Array<{titulo:string;emoji:string}>).map(b => `
    <div class="bci"><div class="bico">${b.emoji}</div><h3>${b.emoji} ${b.titulo}</h3><span class="pf">HOY GRATIS</span></div>`).join("\n");
  const testimonios = (c.testimonios as Array<{nombre:string;estrellas:string;texto:string}>).map((t, i) => `
    <div class="mt2">
      <img src="https://i.pravatar.cc/100?img=${10 + i * 7}" alt="${t.nombre}">
      <div><div class="mt2-n">${t.nombre}</div><div class="mt2-s">${t.estrellas}</div><p>"${t.texto}"</p></div>
    </div>`).join("\n");
  const faqs = (c.faqs as Array<{q:string;a:string}>).map(f => `
    <div class="fi">
      <div class="fq">${f.q}</div>
      <div class="fa"><div class="fac"><p>${f.a}</p></div></div>
    </div>`).join("\n");
  const names = ["Luciana M.","Sebastián R.","Valeria G.","Marcos P.","Camila V.","Diego A.","Florencia L.","Romina T.","Ezequiel P.","Agustina N."];

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--primary:${col};--dark:${colDark};--dark2:#1a1a2e;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Montserrat',sans-serif;font-size:15px;line-height:1.4;color:#374151;background:#F3F4F6;overflow-x:hidden;}
/* TOPBAR */
.tfb{background:#111827;color:#fff;padding:10px 15px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;position:sticky;top:0;z-index:1001;}
.tfb-row{display:flex;align-items:center;justify-content:center;gap:15px;width:100%;}
.tfb .st{font-weight:700;font-size:15px;}
#fsc{font-size:13px;font-weight:800;color:#111827;background:var(--primary);padding:5px 12px;border-radius:4px;min-width:50px;}
.tfb .snb{background:var(--primary);color:#fff;padding:8px 30px;font-weight:800;border-radius:4px;font-size:13px;text-transform:uppercase;border:none;cursor:pointer;font-family:'Montserrat',sans-serif;transition:all .3s;}
.tfb .snb:hover{opacity:0.85;transform:scale(1.05);}
/* LAYOUT */
section{padding:30px 15px;position:relative;}
.container{max-width:100%;margin:0 auto;padding:0 15px;}
h2{font-family:'Playfair Display',serif;font-size:26px;text-align:center;margin-bottom:20px;color:#111827;line-height:1.2;}
h2::after{content:'';display:block;width:60px;height:3px;background:linear-gradient(to right,#1a1a1a,var(--primary));margin:10px auto 0;border-radius:2px;}
/* HERO */
.hero-section{background:linear-gradient(135deg,${colDark} 0%,#1a1a2e 100%);padding:40px 15px 50px;}
.hero-badge{display:inline-block;background:rgba(255,255,255,0.1);border:1px solid var(--primary);border-radius:100px;padding:6px 16px;font-size:12px;color:var(--primary);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;}
.hero-pretitle{font-weight:800;font-size:13px;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-bottom:12px;letter-spacing:1px;}
.hero-title{font-family:'Playfair Display',serif;font-size:30px;font-weight:800;color:#fff;line-height:1.15;margin-bottom:16px;}
.hero-sub{font-size:16px;color:rgba(255,255,255,0.8);line-height:1.6;margin-bottom:30px;max-width:500px;}
.hi{margin:20px auto;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.3);border-radius:12px;max-width:100%;}
.hi img{width:100%;height:auto;display:block;border-radius:12px;}
/* PRECIO */
.ob{background:linear-gradient(135deg,#111827,#1F2937);border-radius:12px;padding:24px;margin:20px auto;border:1px solid var(--primary);animation:glow 2.5s infinite alternate;max-width:500px;}
@keyframes glow{from{box-shadow:0 0 15px rgba(112,48,239,.2)}to{box-shadow:0 0 30px rgba(112,48,239,.5)}}
.pc{display:flex;flex-direction:column;align-items:center;gap:5px;line-height:1;}
.po{font-size:18px;text-decoration:line-through;color:#aaa;}
.pn{font-family:'Playfair Display',serif;font-size:44px;font-weight:700;color:var(--primary);}
.sav{background:linear-gradient(135deg,#1a1a1a,#2a2a2a);border:1px solid var(--primary);color:var(--primary);padding:5px 14px;border-radius:50px;font-weight:bold;font-size:13px;text-transform:uppercase;margin-top:10px;}
.ts{display:flex;justify-content:space-around;margin-top:15px;padding-top:15px;border-top:1px solid #2a2a2a;color:#ddd;font-size:12px;font-weight:600;}
/* CTA */
.cta{background:linear-gradient(135deg,var(--primary),#a020f0);color:#fff;border:none;padding:18px;font-size:18px;font-weight:800;border-radius:50px;cursor:pointer;transition:all .3s;box-shadow:0 8px 25px rgba(112,48,239,.4);display:block;margin:14px auto;width:100%;max-width:500px;text-align:center;text-transform:uppercase;letter-spacing:.5px;animation:pb 1.8s infinite;font-family:'Montserrat',sans-serif;text-decoration:none;}
.cta:hover{transform:translateY(-3px) scale(1.02);animation:none;opacity:.95;}
@keyframes pb{0%{transform:scale(1)}50%{transform:scale(1.03)}100%{transform:scale(1)}}
/* PAIN / GAIN sections con fondo oscuro */
.dark-section{background:linear-gradient(135deg,#111827,#1F2937);color:#fff;}
.dark-section h2{color:#fff;}
.dark-section h2::after{background:linear-gradient(to right,#fff,var(--primary));}
.bc{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;margin-bottom:20px;overflow:hidden;}
.bh{padding:15px;border-bottom:1px solid rgba(255,255,255,0.1);}
.bh h3{font-family:'Playfair Display',serif;font-size:20px;color:#fff;margin:0;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px;}
.bh h3::after{display:none;}
.bl{padding:20px;}
.bi{display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;font-size:15px;line-height:1.5;color:#e5e7eb;}
.bi span strong{color:#fff;}
/* MÓDULOS */
.es-section{background:#F3F4F6;}
.ma{max-width:600px;margin:10px auto;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.07);border:1px solid #eee;background:#fff;}
.mh{padding:16px 18px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff;transition:background .2s;}
.mh:hover{background:#f9fafb;}
.mhl{display:flex;align-items:center;gap:12px;}
.mb2{background:#111827;color:var(--primary);padding:4px 12px;border-radius:50px;font-size:11px;font-weight:800;white-space:nowrap;}
.mt{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#111827;line-height:1.3;}
.marr{font-size:20px;color:var(--primary);font-weight:700;transition:transform .3s;flex-shrink:0;}
.mb3{max-height:0;overflow:hidden;transition:max-height .4s;}
.mb3.open{max-height:600px;}
.mbi{padding:0 18px 18px;border-top:1px solid #f0f0f0;}
.mbi ul{list-style:none;padding:12px 0 0;margin:0;}
.mbi li{padding:6px 0 6px 24px;position:relative;font-size:14px;color:#374151;line-height:1.5;border-bottom:1px solid #f5f5f5;}
.mbi li:last-child{border-bottom:none;}
.mbi li::before{content:'✔';color:var(--primary);position:absolute;left:0;top:6px;font-size:13px;}
/* BONOS */
.bg{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:15px;margin:25px auto 0;max-width:700px;}
.bci{background:#fff;border:1px solid #eee;border-radius:12px;padding:16px 12px;text-align:center;transition:all .3s;box-shadow:0 4px 12px rgba(0,0,0,.06);display:flex;flex-direction:column;gap:8px;}
.bci:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.1);}
.bico{font-size:40px;margin-bottom:4px;}
.bci h3{font-size:13px;font-weight:700;color:#111827;line-height:1.3;flex-grow:1;}
.pf{display:block;color:var(--primary);font-size:15px;font-weight:800;}
/* COUNTDOWN */
.owe{background:linear-gradient(135deg,rgba(17,24,39,.95),rgba(10,10,10,.98));border:1px solid var(--primary);border-radius:12px;padding:24px;margin:20px auto;text-align:center;box-shadow:0 0 20px rgba(112,48,239,.3);max-width:500px;}
.owe h3{color:var(--primary);font-family:'Playfair Display',serif;font-size:22px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:10px;}
.owe p{font-size:14px;color:rgba(255,255,255,.8);line-height:1.5;margin-bottom:15px;}
.clt{font-size:13px;color:rgba(255,255,255,.7);margin-bottom:8px;}
.cte{display:flex;justify-content:center;gap:10px;text-align:center;margin-bottom:15px;}
.cs2-block{background:rgba(0,0,0,.4);padding:12px 16px;border-radius:10px;min-width:64px;border:1px solid rgba(255,255,255,.1);}
.cn{font-size:30px;font-weight:800;color:#fff;line-height:1;}
.cl2{font-size:10px;text-transform:uppercase;color:rgba(255,255,255,.6);margin-top:4px;}
/* SOCIAL PROOF */
.ub{max-width:500px;margin:20px auto 10px;display:flex;flex-direction:column;gap:10px;}
.vb,.sb{color:#fff;font-weight:700;padding:12px;border-radius:8px;font-size:15px;text-align:center;}
.vb{background:#111827;box-shadow:0 0 15px rgba(0,0,0,.4);}
.sb{background:linear-gradient(135deg,#EF4444,#be123c);display:flex;align-items:center;justify-content:center;gap:10px;}
.pd-dot{width:12px;height:12px;background:#fff;border-radius:50%;animation:pr 1.5s infinite;flex-shrink:0;}
@keyframes pr{0%{transform:scale(.9);box-shadow:0 0 0 0 rgba(255,255,255,.7)}70%{transform:scale(1);box-shadow:0 0 0 10px transparent}100%{transform:scale(.9)}}
/* TESTIMONIOS */
.mts{display:flex;flex-direction:column;gap:14px;max-width:600px;margin:20px auto 0;}
.mt2{display:flex;align-items:flex-start;gap:12px;background:#fff;border-radius:12px;padding:14px;box-shadow:0 3px 10px rgba(0,0,0,.06);border:1px solid #eee;}
.mt2 img{width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid var(--primary);}
.mt2-n{font-weight:700;font-size:14px;color:#111827;margin-bottom:2px;}
.mt2-s{color:var(--primary);font-size:12px;margin-bottom:5px;}
.mt2 p{font-size:13px;color:#374151;line-height:1.5;margin:0;}
/* GARANTIA */
.gb{display:flex;align-items:center;justify-content:center;gap:14px;background:#fff;border-radius:12px;padding:16px;margin:20px auto;box-shadow:0 4px 12px rgba(0,0,0,.06);max-width:500px;}
.gb-icon{font-size:50px;flex-shrink:0;}
.gb h3{font-size:16px;color:#111827;margin:0 0 4px;font-weight:800;}
.gb p{font-size:13px;color:#374151;margin:0;line-height:1.5;}
/* FAQ */
.fi{margin-bottom:10px;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.06);border:1px solid #eee;background:#fff;max-width:600px;margin-left:auto;margin-right:auto;}
.fq{padding:15px 18px;font-weight:700;font-size:15px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;}
.fq::after{content:'+';font-size:22px;color:var(--primary);}
.fq.active::after{content:'-';}
.fa{padding:0 18px;max-height:0;overflow:hidden;transition:max-height .4s;font-size:14px;}
.fa.active{max-height:500px;padding:15px 18px;}
.fac{padding-bottom:10px;line-height:1.6;border-top:1px solid #eee;padding-top:15px;color:#374151;}
/* FOOTER */
footer{background:#111827;color:#aaa;text-align:center;padding:24px 15px;font-size:12px;}
/* POPUP */
#spp{position:fixed;bottom:20px;left:20px;z-index:9000;background:rgba(17,24,39,.97);color:#fff;border-radius:10px;padding:12px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 30px rgba(0,0,0,.2);transform:translateY(20px);opacity:0;transition:transform .5s,opacity .5s;visibility:hidden;border:1px solid rgba(255,255,255,.1);}
#spp.vis{transform:translateY(0);opacity:1;visibility:visible;}
#spp img{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--primary);}
#spp p{margin:0;font-size:13px;line-height:1.4;}
#spp strong{color:var(--primary);font-weight:700;}
#spp span{display:block;font-size:11px;color:#999;margin-top:3px;}
@media(max-width:480px){#spp{left:10px;right:10px;bottom:10px;}}
@media(min-width:768px){.bg{grid-template-columns:repeat(3,1fr);}.hero-title{font-size:38px;}}
</style>
</head>
<body>

<!-- TOPBAR -->
<div class="tfb">
  <div class="tfb-row">
    <span class="st">⏰ ¡Oferta por tiempo limitado!</span>
    <div id="fsc">09:59</div>
  </div>
  <button onclick="document.getElementById('precio-section').scrollIntoView({behavior:'smooth'})" class="snb">ACCEDER AHORA</button>
</div>

<!-- HERO -->
<section class="hero-section">
  <div class="container" style="max-width:600px;text-align:center;">
    <div class="hero-badge">📚 ${(c as {badge:string}).badge}</div>
    <p class="hero-pretitle">💪 ${(c as {headline_top:string}).headline_top}</p>
    <h1 class="hero-title">${(c as {headline_main:string}).headline_main}</h1>
    <p class="hero-sub">${(c as {subheadline:string}).subheadline}</p>
    <div class="hi" style="box-shadow:0 0 30px rgba(112,48,239,.4);">
      <div style="width:100%;height:300px;background:linear-gradient(135deg,${col}22,${col}44);display:flex;align-items:center;justify-content:center;border-radius:12px;border:1px solid ${col}66;">
        <div style="text-align:center;color:#fff;">
          <div style="font-size:80px;margin-bottom:16px;">📚</div>
          <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;padding:0 20px;">${titulo}</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- DOLOR -->
<section class="dark-section" style="padding:30px 15px;">
  <div class="container" style="max-width:600px;">
    <div class="bc">
      <div class="bh"><h3>💬 ${(c as {pain_title:string}).pain_title}</h3></div>
      <div class="bl">${pains}</div>
    </div>
    <div style="text-align:center;padding:15px 0;font-size:32px;letter-spacing:8px;">💥 💥 💥</div>
  </div>
</section>

<!-- SOLUCIÓN -->
<section class="dark-section" style="padding:30px 15px;">
  <div class="container" style="max-width:600px;">
    <div class="bc">
      <div class="bh"><h3>✅ ${(c as {gains_title:string}).gains_title}</h3></div>
      <div class="bl">${gains}</div>
    </div>
  </div>
</section>

<!-- MÓDULOS -->
<section class="es-section">
  <div class="container" style="max-width:700px;">
    <h2>📚 ${(c as {modulos_titulo:string}).modulos_titulo}</h2>
    <p style="text-align:center;font-size:15px;color:#6B7280;margin-top:-10px;margin-bottom:20px;">Tocá cada módulo para ver el contenido</p>
    ${modulos}
  </div>
</section>

<!-- BONOS -->
<section class="es-section" style="padding-top:0;">
  <div class="container" style="max-width:700px;text-align:center;">
    <h2>🎁 Además recibís <strong><u>BONOS Exclusivos</u></strong></h2>
    <p>Un <strong>sistema completo para transformar tus resultados</strong> 💥</p>
  </div>
  <div class="bg">${bonos}</div>
</section>

<!-- PRECIO -->
<section id="precio-section" class="dark-section" style="padding:30px 15px;">
  <div class="container" style="max-width:500px;text-align:center;">
    <div class="ob">
      <div class="pc">
        <div class="po">USD $${(c as {precio_tachado:string}).precio_tachado}</div>
        <div class="pn">💚 USD $${precio}</div>
        <div class="sav">AHORRÁ HOY</div>
      </div>
      <div class="ts">
        <div>🛡️ Compra Segura</div>
        <div>⚡ Acceso Instantáneo</div>
      </div>
    </div>
    <div class="owe">
      <h3>🔥 ¡OFERTA POR TIEMPO LIMITADO!</h3>
      <p>Tu acceso con todos los BONOS de REGALO solo está reservado por los próximos minutos.</p>
      <div class="clt">La oferta finaliza en:</div>
      <div class="cte" id="occ"></div>
      <div style="background:linear-gradient(135deg,var(--primary),#a020f0);color:#fff;padding:8px 20px;border-radius:50px;font-weight:800;font-size:15px;text-transform:uppercase;display:inline-block;">¡AHORRÁ AHORA MISMO!</div>
    </div>
    <div class="ub">
      <div class="vb"><strong><span id="vc1">87</span> personas</strong> están viendo esta oferta</div>
      <div class="sb"><span class="pd-dot"></span> ¡Últimos <strong>cupos</strong> con descuento!</div>
    </div>
    <button onclick="document.getElementById('precio-section').scrollIntoView({behavior:'smooth'})" class="cta">🟢 ¡${(c as {cta_text:string}).cta_text}</button>
    <div class="gb">
      <div class="gb-icon">🛡️</div>
      <div><h3>Compra 100% Segura</h3><p><strong>${(c as {garantia:string}).garantia}</strong></p></div>
    </div>
  </div>
</section>

<!-- TESTIMONIOS -->
<section style="background:#fff;padding:30px 15px;">
  <div class="container" style="max-width:700px;">
    <h2>LO QUE DICEN NUESTROS CLIENTES 💬</h2>
    <div class="mts">${testimonios}</div>
  </div>
</section>

<!-- GARANTÍA -->
<section class="es-section">
  <div class="container" style="max-width:500px;text-align:center;">
    <h2>🛡️ Compra sin riesgos</h2>
    <p>${(c as {garantia:string}).garantia}</p>
    <div class="gb">
      <div class="gb-icon">🤝</div>
      <div><h3>Garantía de Satisfacción</h3><p>Tu confianza es lo más importante para nosotros.</p></div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="es-section">
  <div class="container" style="max-width:600px;">
    <h2>🤔 Preguntas Frecuentes</h2>
    ${faqs}
    <button onclick="document.getElementById('precio-section').scrollIntoView({behavior:'smooth'})" class="cta">🟢 ¡${(c as {cta_text:string}).cta_text}</button>
  </div>
</section>

<!-- CTA FINAL -->
<section class="dark-section" style="padding:40px 15px;text-align:center;">
  <div class="container" style="max-width:500px;">
    <h2 style="color:#fff;">🚀 EMPEZÁ HOY MISMO</h2>
    <p style="color:#ddd;margin-bottom:24px;">Acceso inmediato a todo el contenido y los bonos.</p>
    <div class="ob">
      <div class="pc">
        <div class="po">USD $${(c as {precio_tachado:string}).precio_tachado}</div>
        <div class="pn">💚 USD $${precio}</div>
        <div class="sav">AHORRÁ HOY</div>
      </div>
      <div class="ts"><div>🛡️ Compra Segura</div><div>⚡ Acceso Instantáneo</div></div>
    </div>
    <button onclick="document.getElementById('precio-section').scrollIntoView({behavior:'smooth'})" class="cta">🟢 ¡${(c as {cta_text:string}).cta_text}</button>
  </div>
</section>

<footer>
  <p>${(c as {footer_text:string}).footer_text}</p>
  <p>Este producto es digital. No se envía ningún producto físico.</p>
</footer>

<!-- POPUP PRUEBA SOCIAL -->
<div id="spp">
  <img alt="Avatar" id="spa">
  <div><p><strong id="spn"></strong> acaba de adquirir <strong>${titulo}</strong>.</p><span>hace unos segundos</span></div>
</div>

<script>
(function(){
  var names=${JSON.stringify(names)};

  // Countdown topbar + oferta
  function startCD(sec,elId,render){
    var t=sec;
    setInterval(function(){
      var m=Math.floor(t/60),s=t%60;
      var mm=(m<10?'0':'')+m,ss=(s<10?'0':'')+s;
      if(render)render(mm,ss);
      var el=document.getElementById(elId);
      if(el)el.textContent=mm+':'+ss;
      if(--t<0)t=sec;
    },1000);
  }
  startCD(600,'fsc',null);
  startCD(600,'',function(mm,ss){
    var occ=document.getElementById('occ');
    if(occ)occ.innerHTML=
      '<div class="cs2-block"><div class="cn">'+mm+'</div><div class="cl2">Min</div></div>'+
      '<div class="cs2-block"><div class="cn">'+ss+'</div><div class="cl2">Seg</div></div>';
  });

  // FAQ
  document.querySelectorAll('.fq').forEach(function(q){
    q.onclick=function(){q.classList.toggle('active');q.nextElementSibling.classList.toggle('active');};
  });

  // Módulos acordeón
  window.togMod=function(h){
    var b=h.nextElementSibling,open=b.classList.contains('open');
    document.querySelectorAll('.mb3.open').forEach(function(x){x.classList.remove('open');x.previousElementSibling.querySelector('.marr').textContent='+';});
    if(!open){b.classList.add('open');h.querySelector('.marr').textContent='-';}
  };

  // Popup prueba social
  var popup=document.getElementById('spp');
  var pav=document.getElementById('spa');
  var pn=document.getElementById('spn');
  function showPop(){
    if(!popup||!pav||!pn)return;
    pn.textContent=names[Math.floor(Math.random()*names.length)];
    pav.src='https://i.pravatar.cc/100?u='+Math.random();
    popup.classList.add('vis');
    setTimeout(function(){popup.classList.remove('vis');},5000);
  }
  setTimeout(showPop,8000);
  setInterval(showPop,18000);

  // Viewers counter
  setInterval(function(){
    var c=Math.floor(Math.random()*20)+80;
    document.querySelectorAll('[id^="vc"]').forEach(function(el){el.textContent=c;});
  },5000);
})();
</script>
</body>
</html>`;
}
