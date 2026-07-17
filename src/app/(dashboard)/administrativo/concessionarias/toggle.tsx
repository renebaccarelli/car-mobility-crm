"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleConcessionariaAtivoAction } from "./actions";

export function ConcessionariaAtivoToggle({
  concessionariaId,
  ativo,
}: {
  concessionariaId: string;
  ativo: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={ativo}
      disabled={isPending}
      onCheckedChange={(checked) =>
        startTransition(() => {
          toggleConcessionariaAtivoAction(concessionariaId, checked);
        })
      }
    />
  );
}
