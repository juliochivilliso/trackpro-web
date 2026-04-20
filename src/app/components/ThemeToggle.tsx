"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render a placeholder with fixed dimensions to avoid layout shift
  if (!mounted) {
    return (
      <button
        className="theme-toggle-btn"
        aria-label="Toggle theme"
        disabled
      >
        <div className="w-[18px] h-[18px]" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      id="theme-toggle"
      className="theme-toggle-btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className={`theme-toggle-icon ${isDark ? "rotate-0" : "-rotate-90 scale-0"}`}>
        <Sun className="w-[18px] h-[18px]" />
      </span>
      <span className={`theme-toggle-icon absolute ${isDark ? "rotate-90 scale-0" : "rotate-0"}`}>
        <Moon className="w-[18px] h-[18px]" />
      </span>
    </button>
  );
}
