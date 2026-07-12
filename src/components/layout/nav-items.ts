import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Filter, Users, FileText, Wrench, UserCog } from "lucide-react";

export type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/inicio", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Filter },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Documentos", href: "/documentos", icon: FileText },
];

export const NAV_ITEMS_ADMIN: NavItem[] = [
  { label: "Serviços", href: "/administrativo/servicos", icon: Wrench },
  { label: "Vendedores", href: "/administrativo/vendedores", icon: UserCog },
];
