"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleLembreteConcluidoAction } from "../actions";

export function LembreteToggle({ id, concluido }: { id: string; concluido: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Checkbox
      checked={concluido}
      disabled={isPending}
      onCheckedChange={(checked) =>
        startTransition(() => {
          toggleLembreteConcluidoAction(id, checked === true);
        })
      }
    />
  );
}
