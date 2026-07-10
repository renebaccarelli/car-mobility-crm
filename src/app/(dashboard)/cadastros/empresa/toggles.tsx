"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleMetodoPagamentoAction, toggleUsuarioAtivoAction } from "../actions";

export function MetodoPagamentoToggle({
  id,
  empresaId,
  ativo,
}: {
  id: string;
  empresaId: string;
  ativo: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={ativo}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(() => {
          toggleMetodoPagamentoAction(id, empresaId, checked);
        });
      }}
    />
  );
}

export function UsuarioAtivoToggle({
  usuarioId,
  empresaId,
  ativo,
}: {
  usuarioId: string;
  empresaId: string;
  ativo: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={ativo}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(() => {
          toggleUsuarioAtivoAction(usuarioId, empresaId, checked);
        });
      }}
    />
  );
}
