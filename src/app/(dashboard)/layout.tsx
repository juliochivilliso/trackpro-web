"use client";

import { LayoutDashboard, Map, Settings, History, Bell, Activity, UserCheck, Sparkles, SlidersHorizontal, BarChart3, Wrench, Car, Users, Cpu, ExternalLink } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { SidebarNav } from "../components/SidebarNav";
import { UserInfo } from "../components/UserInfo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-background-app)] overflow-hidden text-[var(--color-text-primary)]">

      {/* Top Header — full width */}
      <header className="glass-panel h-16 mx-4 mt-4 mb-3 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TrackPro Logo" className="w-8 h-8 object-contain drop-shadow" />
            <span className="font-black text-base tracking-tight uppercase">
              TRACK<span className="text-[var(--color-accent-blue)]">Pro</span>
            </span>
          </div>
          {/* Separador */}
          <div className="w-px h-5 bg-[var(--color-border-glass)]" />
          {/* System status */}
          <div className="flex items-center gap-2">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
              <div className="relative w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className="text-xs font-mono text-green-400 tracking-wider">SYSTEM ONLINE</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--color-accent-blue)]" />
            <span className="text-sm font-mono text-[var(--color-text-secondary)]">24 VEHÍCULOS ACTIVOS</span>
          </div>
          <div className="w-px h-6 bg-[var(--color-border-glass)]"></div>
          <ThemeToggle />
          <div className="w-px h-6 bg-[var(--color-border-glass)]"></div>
          <UserInfo />
        </div>
      </header>

      {/* Body: sidebar + main — misma altura */}
      <div className="flex flex-1 overflow-hidden gap-4 px-4 pb-4 pt-0">

        {/* Sidebar */}
        <aside className="w-64 glass-panel flex flex-col transition-all duration-300 z-20 overflow-y-auto shrink-0 custom-scrollbar">
          <nav className="flex-1 py-6 px-3 space-y-5">

            {/* ── MONITOREO ── */}
            <div>
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-50">
                Monitoreo
              </p>
              <SidebarNav
                items={[
                  { href: "/", icon: <Map />, label: "Mapa en Vivo" },
                  { href: "/flota", icon: <LayoutDashboard />, label: "Flota" },
                  { href: "/asignacion", icon: <UserCheck />, label: "Asignación" },
                  { href: "/historial", icon: <History />, label: "Historial" },
                ]}
              />
            </div>

            {/* ── INTELIGENCIA ── */}
            <div>
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-50">
                Inteligencia
              </p>
              <SidebarNav
                items={[
                  { href: "/ia", icon: <Sparkles />, label: "Asistente IA" },
                  { href: "/reportes", icon: <BarChart3 />, label: "Reportes" },
                  { href: "/alertas", icon: <Bell />, label: "Alertas", badge: 3 },
                ]}
              />
            </div>

            {/* ── ADMINISTRACIÓN ── */}
            <div>
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-50">
                Administración
              </p>
              <SidebarNav
                items={[
                  { href: "/mantenimiento/vehiculos", icon: <Car />, label: "Vehículos" },
                  { href: "/mantenimiento/conductores", icon: <Users />, label: "Conductores" },
                  { href: "/mantenimiento/equipos", icon: <Cpu />, label: "Equipos GPS" },
                  { href: "/mantenimiento", icon: <Wrench />, label: "Centro de Mant." },
                ]}
              />
            </div>

            {/* ── SISTEMA ── */}
            <div>
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-50">
                Sistema
              </p>
              <SidebarNav
                items={[
                  { href: "/alertas/configuracion", icon: <SlidersHorizontal />, label: "Config. Alertas" },
                  { href: "/ajustes", icon: <Settings />, label: "Ajustes" },
                ]}
              />
            </div>

            {/* ── PORTAL TRIAX ── */}
            <div className="pt-4 mt-4 border-t border-[var(--color-border-glass)]">
              <a href="http://localhost:3001" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-glass)] transition-colors group">
                <ExternalLink className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-blue)] transition-colors" />
                <span className="font-semibold text-sm">Portal TRIAX</span>
              </a>
            </div>

          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 relative glass-panel overflow-hidden">
          {children}
        </main>

      </div>
    </div>
  );
}
