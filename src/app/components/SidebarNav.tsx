"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type NavItemDef = {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
};

export function SidebarNav({ items }: { items: NavItemDef[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group no-underline ${
              active
                ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`[&>svg]:w-5 [&>svg]:h-5 transition-colors ${
                  active
                    ? "text-blue-400"
                    : "text-gray-400 group-hover:text-blue-400"
                }`}
              >
                {item.icon}
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            {item.badge != null && item.badge > 0 && (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}
