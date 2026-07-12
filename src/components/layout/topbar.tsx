"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, LogOut, Calendar } from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { logoutAction } from "@/app/(dashboard)/actions";

type Lembrete = {
  id: string;
  texto: string;
  data: string;
};

function initials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Topbar({
  session,
  lembretesProximos,
}: {
  session: SessionPayload;
  lembretesProximos: Lembrete[];
}) {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar cliente" className="pl-9" />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
            <Calendar className="size-4" />
            Agenda
            {lembretesProximos.length > 0 ? (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {lembretesProximos.length}
              </span>
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <p className="px-1.5 py-1 text-xs text-muted-foreground">
              Você tem {lembretesProximos.length} lembrete(s) nos próximos 3 dias.
            </p>
            {lembretesProximos.map((lembrete) => (
              <DropdownMenuItem key={lembrete.id} className="flex-col items-start gap-0.5">
                <span className="text-sm">{lembrete.texto}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(lembrete.data).toLocaleDateString("pt-BR")}
                </span>
              </DropdownMenuItem>
            ))}
            {lembretesProximos.length === 0 ? (
              <DropdownMenuItem disabled>Nenhum lembrete próximo</DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" />}>
            <Avatar className="size-8">
              <AvatarFallback>{initials(session.nome)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{session.nome}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => logoutAction()}>
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
