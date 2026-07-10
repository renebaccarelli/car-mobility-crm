"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTarefaStatusAction } from "./tarefa-actions";
import type { StatusTarefa } from "@prisma/client";

const OPCOES: { value: StatusTarefa; label: string }[] = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDA", label: "Concluída" },
];

export function TarefaStatusSelect({
  tarefaId,
  clienteId,
  status,
}: {
  tarefaId: string;
  clienteId: string;
  status: StatusTarefa;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(() => {
          updateTarefaStatusAction(tarefaId, clienteId, value as StatusTarefa);
        })
      }
    >
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPCOES.map((opcao) => (
          <SelectItem key={opcao.value} value={opcao.value}>
            {opcao.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
