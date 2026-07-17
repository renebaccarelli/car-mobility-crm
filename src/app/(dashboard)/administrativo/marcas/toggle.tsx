"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleMarcaAtivoAction } from "./actions";

export function MarcaAtivoToggle({ marcaId, ativo }: { marcaId: string; ativo: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={ativo}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(() => {
          toggleMarcaAtivoAction(marcaId, checked);
        });
      }}
    />
  );
}
