"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleServicoAtivoAction } from "./actions";

export function ServicoAtivoToggle({ servicoId, ativo }: { servicoId: string; ativo: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={ativo}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(() => {
          toggleServicoAtivoAction(servicoId, checked);
        });
      }}
    />
  );
}
