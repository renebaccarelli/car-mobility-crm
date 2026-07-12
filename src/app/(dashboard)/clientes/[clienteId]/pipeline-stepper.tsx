"use client";

import { useTransition } from "react";
import { ETAPA_PROCESSO_LABELS, ETAPA_PROCESSO_ORDEM } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { updateEtapaAction } from "../actions";
import type { EtapaProcesso } from "@prisma/client";

export function PipelineStepper({
  clienteId,
  etapaAtual,
  podeEditar,
}: {
  clienteId: string;
  etapaAtual: EtapaProcesso;
  podeEditar: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const indiceAtual = ETAPA_PROCESSO_ORDEM.indexOf(etapaAtual);

  return (
    <div className="flex flex-wrap overflow-hidden rounded-lg border">
      {ETAPA_PROCESSO_ORDEM.map((etapa, index) => {
        const concluida = index <= indiceAtual;
        return (
          <button
            key={etapa}
            type="button"
            disabled={isPending || !podeEditar}
            onClick={() => startTransition(() => updateEtapaAction(clienteId, etapa))}
            className={cn(
              "border-r px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors last:border-r-0 hover:opacity-80 disabled:pointer-events-none",
              concluida
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {ETAPA_PROCESSO_LABELS[etapa]}
          </button>
        );
      })}
    </div>
  );
}
