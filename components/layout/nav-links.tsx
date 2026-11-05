"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Eye,
  LayoutGrid,
  Users,
} from "lucide-react";

const LINKS = [
  { href: "/", label: "Доска", icon: LayoutGrid },
  { href: "/participants", label: "Участники", icon: Users },
  { href: "/summary", label: "Итоги недели", icon: BarChart3 },
  { href: "/simple", label: "Простой вид", icon: Eye },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Основная навигация"
      className="scrollbar-soft flex items-center gap-1 overflow-x-auto"
    >
      {LINKS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav-pill"
            aria-current={active ? "page" : undefined}
          >
            <Icon size={17} strokeWidth={2.2} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
