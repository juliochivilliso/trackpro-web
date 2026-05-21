"use client"

import { useEffect, useState, useRef } from "react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export function UserInfo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only execute on client side where document is defined
    const isAuth = document.cookie.includes("gps_auth=authenticated");
    setIsAuthenticated(isAuth);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    document.cookie = "gps_auth=; Max-Age=0; path=/";
    window.location.href = '/login';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors focus:outline-none"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border border-[var(--color-border-glass)]">
            AG
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[var(--color-surface-glass)]"></div>
        </div>
        
        <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-sm font-medium leading-none text-[var(--color-text-primary)]">Admin GPS Smart</span>
          <span className="text-[10px] text-[var(--color-text-secondary)] mt-1 tracking-wider uppercase">Administrador</span>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform duration-300 ml-1 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-56 glass-panel rounded-2xl bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] shadow-xl dropdown-enter z-[9999] overflow-hidden">
          
          <div className="p-4 border-b border-[var(--color-border-glass)]">
            <p className="font-bold text-sm text-[var(--color-text-primary)]">Admin GPS Smart</p>
            <p className="text-xs text-[var(--color-text-secondary)] truncate">admin@gpssmart.com</p>
          </div>

          <div className="p-2 space-y-1">
            <Link 
              href="/ajustes"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors group"
            >
              <User className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors" />
              Mi Perfil
            </Link>
            <Link 
              href="/ajustes"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors group"
            >
              <Settings className="w-4 h-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors" />
              Ajustes
            </Link>
          </div>

          <div className="p-2 border-t border-[var(--color-border-glass)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 font-medium rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
