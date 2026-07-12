"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleVendedorAtivoAction } from "./actions";

export function VendedorAtivoToggle({ usuarioId, ativo }: { usuarioId: string; ativo: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={ativo}
      disabled={isPending}
      onCheckedChange={(checked) =>
        startTransition(() => {
          toggleVendedorAtivoAction(usuarioId, checked);
        })
      }
    />
  );
}
