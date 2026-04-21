"use client";

import { LayoutDashboard, Map, Settings, History, Bell, Activity, UserCheck, Sparkles, SlidersHorizontal, BarChart3 } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { SidebarNav } from "../components/SidebarNav";
import { UserInfo } from "../components/UserInfo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex bg-[var(--color-background-app)] overflow-hidden text-[var(--color-text-primary)]">
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 flex flex-col transition-all duration-300 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-[var(--color-border-glass)]">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="TrackPro Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">TrackPro</h1>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <SidebarNav
            items={[
              { href: "/", icon: <Map />, label: "Mapa en Vivo" },
              { href: "/flota", icon: <LayoutDashboard />, label: "Flota" },
              { href: "/asignacion", icon: <UserCheck />, label: "Asignación" },
              { href: "/ia", icon: <Sparkles />, label: "Asistente IA" },
              { href: "/historial", icon: <History />, label: "Historial" },
              { href: "/alertas", icon: <Bell />, label: "Alertas", badge: 3 },
              { href: "/alertas/configuracion", icon: <SlidersHorizontal />, label: "Config. Alertas" },
              { href: "/reportes", icon: <BarChart3 />, label: "Reportes" },
            ]}
          />
        </nav>

        <div className="p-4 border-t border-[var(--color-border-glass)]">
          <SidebarNav
            items={[
              { href: "/ajustes", icon: <Settings />, label: "Ajustes" },
            ]}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen py-4 pr-4">
        {/* Top Header */}
        <header className="glass-panel h-16 w-full mb-4 px-6 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-2 h-2 rounded-full bg-green-500 animate-pulse relative">
              <div className="absolute w-4 h-4 bg-green-500/30 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs font-mono text-green-400 font-medium tracking-wider">SYSTEM ONLINE</span>
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

        {/* Page Content */}
        <main className="flex-1 relative glass-panel overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
