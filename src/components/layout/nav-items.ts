import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Filter,
  Users,
  FileText,
  Wrench,
  UserCog,
  Building2,
  Tag,
} from "lucide-react";

export type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
};

export const DASHBOARD_ITEM: NavItem = { label: "Dashboard", href: "/inicio", icon: LayoutDashboard };
export const LEADS_ITEM: NavItem = { label: "Leads", href: "/leads", icon: Filter };
export const CLIENTES_ITEM: NavItem = { label: "Clientes", href: "/clientes", icon: Users };
export const DOCUMENTOS_ITEM: NavItem = { label: "Documentos", href: "/documentos", icon: FileText };
export const VENDEDORES_ITEM: NavItem = {
  label: "Vendedores",
  href: "/administrativo/vendedores",
  icon: UserCog,
};

export const NAV_ITEMS: NavItem[] = [DASHBOARD_ITEM, LEADS_ITEM, CLIENTES_ITEM, DOCUMENTOS_ITEM];

export const NAV_ITEMS_ADMIN: NavItem[] = [
  { label: "Serviços", href: "/administrativo/servicos", icon: Wrench },
  { label: "Marcas", href: "/administrativo/marcas", icon: Tag },
  { label: "Concessionárias", href: "/administrativo/concessionarias", icon: Building2 },
];

export const NAV_ITEMS_CONCESSIONARIA: NavItem[] = [DASHBOARD_ITEM];
