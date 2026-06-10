"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const mockEbooks = [
  { id: 1, titulo: "Recetas Sin Gluten", paginas: 20, fecha: "10 Jun 2025", estado: "listo" },
  { id: 2, titulo: "Marketing Digital 2025", paginas: 15, fecha: "8 Jun 2025", estado: "listo" },
  { id: 3, titulo: "Meditación para Principiantes", paginas: 10, fecha: "5 Jun 2025", estado: "listo" },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ebooks");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return (
    <main style={{ minHeight: "100vh", background: "#090820", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
        <p style={{ color: "#a78bfa" }}>Cargando...</p>
      </div>
    </main>
  );

  if (!session) return null;

  const user = session.user;

  return (
    <main style={{ minHeight: "100vh", background: "#090820", color: "white", fontFamily: "sans-serif" }}>

      {/* Sidebar */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: 240, borderRight: "1px solid rgba(112,48,239,0.2)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8, background: "rgba(0,0,0,0.2)" }}>

          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "white", marginBottom: 24, padding: "0 8px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7030EF,#DB1FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>
            <span style={{ fontWeight: 800, fontSize: 17 }}>EbookAI</span>
          </a>

          {/* Nav items */}
          {[
            { id: "ebooks", icon: "📚", label: "Mis Ebooks" },
            { id: "crear", icon: "✨", label: "Crear Ebook" },
            { id: "creativos", icon: "🎨", label: "Creativos" },
            { id: "configuracion", icon: "⚙️", label: "Configuración" },
          ].map(item => (
            <button key={item.id} onClick={() => {
              if (item.id === "crear") router.push("/generator");
              else setActiveTab(item.id);
            }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, textAlign: "left", background: activeTab === item.id ? "rgba(112,48,239,0.25)" : "transparent", color: activeTab === item.id ? "white" : "#a78bfa", borderLeft: activeTab === item.id ? "2px solid #7030EF" : "2px solid transparent" }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}

          {/* User */}
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(112,48,239,0.2)", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 8 }}>
              {user?.image ? (
                <img src={user.image} alt="" style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #7030EF" }} />
              ) : (
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7030EF,#DB1FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{user?.name || "Usuario"}</div>
                <div style={{ fontSize: 11, color: "#7a6aaa" }}>Plan Free</div>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })}
              style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(112,48,239,0.3)", background: "transparent", color: "#a78bfa", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>

          {activeTab === "ebooks" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Mis Ebooks</h1>
                  <p style={{ color: "#a78bfa", fontSize: 14 }}>Todos tus ebooks generados</p>
                </div>
                <button onClick={() => router.push("/generator")}
                  style={{ padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg,#7030EF,#DB1FFF)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
                  ✨ Nuevo ebook
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                {[
                  { label: "Ebooks creados", value: "3", icon: "📚" },
                  { label: "Páginas generadas", value: "45", icon: "📄" },
                  { label: "Plan actual", value: "Free", icon: "⭐" },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(112,48,239,0.2)", borderRadius: 16, padding: "20px 24px" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: "#a78bfa" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Ebooks list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {mockEbooks.map(eb => (
                  <div key={eb.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(112,48,239,0.2)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#7030EF,#DB1FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{eb.titulo}</div>
                        <div style={{ fontSize: 12, color: "#7a6aaa" }}>{eb.paginas} páginas • {eb.fecha}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(112,48,239,0.2)", border: "1px solid rgba(112,48,239,0.4)", color: "#c4b5fd", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Editar</button>
                      <button style={{ padding: "8px 16px", borderRadius: 10, background: "linear-gradient(135deg,#7030EF,#DB1FFF)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>⬇ PDF</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "creativos" && (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎨</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Creativos Publicitarios</h2>
              <p style={{ color: "#a78bfa", fontSize: 16, marginBottom: 24 }}>Genera posts, stories y banners para Instagram y Facebook</p>
              <span style={{ background: "rgba(219,31,255,0.15)", border: "1px solid rgba(219,31,255,0.4)", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: "#DB1FFF" }}>Próximamente</span>
            </div>
          )}

          {activeTab === "configuracion" && (
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Configuración</h1>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(112,48,239,0.2)", borderRadius: 16, padding: 24, maxWidth: 500 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tu perfil</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  {user?.image ? (
                    <img src={user.image} alt="" style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #7030EF" }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#7030EF,#DB1FFF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700 }}>{user?.name}</div>
                    <div style={{ fontSize: 13, color: "#a78bfa" }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ background: "rgba(112,48,239,0.1)", border: "1px solid rgba(112,48,239,0.3)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#DB1FFF", marginBottom: 4 }}>Plan Free</div>
                  <div style={{ fontSize: 13, color: "#a78bfa" }}>3 ebooks por mes • Hasta 10 páginas</div>
                  <button style={{ marginTop: 12, padding: "8px 18px", borderRadius: 10, background: "linear-gradient(135deg,#7030EF,#DB1FFF)", color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                    Actualizar a Pro →
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
