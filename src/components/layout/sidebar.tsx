"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  NAV_ITEMS,
  NAV_ITEMS_ADMIN,
  NAV_ITEMS_CONCESSIONARIA,
  DASHBOARD_ITEM,
  LEADS_ITEM,
  CLIENTES_ITEM,
  DOCUMENTOS_ITEM,
  VENDEDORES_ITEM,
} from "./nav-items";

function NavList({ items }: { items: typeof NAV_ITEMS }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const isActive = item.href ? pathname.startsWith(item.href) : false;
        const Icon = item.icon;

        if (!item.href) {
          return (
            <li key={item.label}>
              <span className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground/50">
                <Icon className="size-4" />
                {item.label}
              </span>
            </li>
          );
        }

        return (
          <li key={item.label}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({
  perfil,
  version,
}: {
  perfil: "ADMINISTRADOR" | "VENDEDOR" | "CONCESSIONARIA";
  version: string;
}) {
  const mainItems =
    perfil === "ADMINISTRADOR"
      ? [DASHBOARD_ITEM, LEADS_ITEM, VENDEDORES_ITEM, CLIENTES_ITEM, DOCUMENTOS_ITEM]
      : perfil === "CONCESSIONARIA"
        ? NAV_ITEMS_CONCESSIONARIA
        : NAV_ITEMS;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Image src="/logo.png" alt="Car Mobility" width={83} height={32} priority />
      </div>
      <nav className="flex flex-1 flex-col justify-between overflow-y-auto p-3">
        <NavList items={mainItems} />
        {perfil === "ADMINISTRADOR" ? (
          <div className="space-y-1">
            <p className="px-3 pt-4 text-xs font-semibold uppercase text-muted-foreground/70">
              Administrativo
            </p>
            <NavList items={NAV_ITEMS_ADMIN} />
          </div>
        ) : null}
      </nav>
      <div className="border-t px-5 py-2 text-[10px] text-muted-foreground/60">
        {version === "dev" ? (
          "dev"
        ) : (
          <a
            href={`https://github.com/renebaccarelli/car-mobility-crm/commit/${version}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            v{version}
          </a>
        )}
      </div>
    </aside>
  );
}
