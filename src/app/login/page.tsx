"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    await new Promise((r) => setTimeout(r, 800));

    if (email === "admin@gpssmart.com" && password === "GPS2024") {
      document.cookie = "gps_auth=authenticated; path=/; max-age=86400; SameSite=Lax";
      router.push("/");
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-background-app)] h-screen w-screen flex items-center justify-center">
      <div className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl backdrop-blur-sm p-8 w-full max-w-sm shadow-2xl flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
          <Map className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">GPS SMART</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mb-6">Plataforma de Gestión Vehicular</p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[var(--color-surface-hover)]/50 border border-[var(--color-border-glass)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] transition-all w-full"
            required
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[var(--color-surface-hover)]/50 border border-[var(--color-border-glass)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] transition-all w-full pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
            >
              Credenciales incorrectas. Intenta de nuevo.
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 mt-2 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className="text-[10px] text-[var(--color-text-secondary)] text-center mt-8">
          GPS SMART v2.0 · Sistema de Demostración
        </p>
      </div>
    </div>
  );
}
