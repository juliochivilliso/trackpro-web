"use client"

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export function UserInfo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Only execute on client side where document is defined
    const isAuth = document.cookie.includes("gps_auth=authenticated");
    setIsAuthenticated(isAuth);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border border-[var(--color-border-glass)]">
        AG
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-none">Admin GPS Smart</span>
        <span className="text-[10px] text-[var(--color-text-secondary)] mt-1 tracking-wider uppercase">Administrador · El Rosal</span>
      </div>
      <div className="relative group ml-1">
        <Link 
          href="/ajustes" 
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--color-surface-hover)] flex items-center justify-center"
        >
          <ChevronDown className="w-4 h-4" />
        </Link>
        <div className="absolute top-full mt-1 right-0 bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] shadow-lg rounded px-2 py-1 text-[10px] text-[var(--color-text-primary)] whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
          Ir a Ajustes
        </div>
      </div>
    </div>
  );
}
