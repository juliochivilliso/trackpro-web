"use client"

import { useRouter } from "next/navigation";
import { LogOut, User, Building2, Settings, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function AjustesPage() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'gps_auth=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-8 text-[var(--color-text-primary)]">Ajustes</h1>

      <div className="max-w-2xl flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
          className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <User className="w-5 h-5 text-[var(--color-accent-blue)]" />
            <h2 className="text-lg font-medium text-[var(--color-text-primary)]">Perfil del Usuario</h2>
          </div>
          <div className="flex items-center gap-4 ml-9">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
              AG
            </div>
            <div className="flex flex-col gap-1">
              <div>
                <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Nombre</label>
                <div className="text-[var(--color-text-primary)] text-sm">Admin GPS Smart</div>
              </div>
              <div className="mt-2">
                <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Email</label>
                <div className="text-[var(--color-text-primary)] text-sm">admin@gpssmart.com</div>
              </div>
              <div className="mt-2">
                <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Rol</label>
                <div className="text-[var(--color-text-primary)] text-sm">Administrador</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Building2 className="w-5 h-5 text-[var(--color-accent-blue)]" />
            <h2 className="text-lg font-medium text-[var(--color-text-primary)]">Organización</h2>
          </div>
          <div className="flex flex-col gap-2 ml-9">
            <div>
              <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Nombre</label>
              <div className="text-[var(--color-text-primary)] text-sm">Condominio El Rosal</div>
            </div>
            <div className="mt-1">
              <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Plan</label>
              <div className="text-[var(--color-text-primary)] text-sm">Demo</div>
            </div>
            <div className="mt-1">
              <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Vehículos Activos</label>
              <div className="text-[var(--color-text-primary)] text-sm">5</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Settings className="w-5 h-5 text-[var(--color-accent-blue)]" />
            <h2 className="text-lg font-medium text-[var(--color-text-primary)]">Preferencias</h2>
          </div>
          <div className="flex flex-col gap-3 ml-9">
            <div>
              <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Idioma</label>
              <div className="text-[var(--color-text-primary)] text-sm">Español (RD)</div>
            </div>
            <div>
              <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Zona Horaria</label>
              <div className="text-[var(--color-text-primary)] text-sm">America/Santo_Domingo</div>
            </div>
            <div>
              <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Unidades</label>
              <div className="text-[var(--color-text-primary)] text-sm">Métrico (km, L)</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-4 cursor-default">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-medium text-red-400">Sesión</h2>
          </div>
          <div className="ml-9">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
