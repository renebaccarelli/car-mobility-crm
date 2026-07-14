"use client";

import { startTransition, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, LogOut, KeyRound } from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { PERFIL_LABELS } from "@/lib/labels";
import { logoutAction } from "@/app/(dashboard)/actions";
import { AlterarSenhaDialog } from "@/app/(dashboard)/conta/alterar-senha-dialog";

function initials(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Topbar({ session }: { session: SessionPayload }) {
  const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar cliente" className="pl-9" />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" />}>
            <Avatar className="size-8">
              <AvatarFallback>{initials(session.nome)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{session.nome}</span>
            <Badge variant="papaya">{PERFIL_LABELS[session.perfil]}</Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSenhaDialogOpen(true)}>
              <KeyRound className="size-4" />
              Alterar senha
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startTransition(() => logoutAction())}>
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AlterarSenhaDialog open={senhaDialogOpen} onOpenChange={setSenhaDialogOpen} />
    </header>
  );
}
