"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Wallet,
  ShoppingCart,
  Package,
  Boxes,
  Images,
  Star,
  Contact,
  CreditCard,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV_GROUPS: { label: string | null; items: NavItem[] }[] = [
  {
    label: null,
    items: [{ href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/produtos", label: "Produtos", icon: Package },
      { href: "/admin/estoque", label: "Estoque", icon: Boxes },
    ],
  },
  {
    label: "Vendas",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
      { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
      { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
    ],
  },
  {
    label: "Pessoas",
    items: [
      { href: "/admin/clientes", label: "Clientes", icon: Contact },
      { href: "/admin/usuarios", label: "Equipe", icon: Users },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { href: "/admin/banners", label: "Banners", icon: Images },
      { href: "/admin/avaliacoes", label: "Avaliações", icon: Star },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5 p-3">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-1">
          {group.label && (
            <p className="px-3 pb-1 text-[10px] font-extrabold tracking-widest text-sidebar-foreground/40 uppercase">
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                {active && (
                  <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary" />
                )}
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active && "text-sidebar-primary"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
