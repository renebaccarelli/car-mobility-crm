import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Filter,
  Users,
  Inbox,
  Building2,
  FileText,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/inicio", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Filter },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Inbox", icon: Inbox },
  { label: "Cadastros", href: "/cadastros", icon: Building2 },
  { label: "Documentos", href: "/documentos", icon: FileText },
  { label: "Baixa de pagamento", icon: Receipt },
  { label: "Financeiro", icon: Wallet },
  { label: "Relatórios", icon: BarChart3 },
];

export const NAV_ITEMS_CONFIG: NavItem[] = [
  { label: "Administrativo", href: "/administrativo/servicos", icon: Settings },
];
