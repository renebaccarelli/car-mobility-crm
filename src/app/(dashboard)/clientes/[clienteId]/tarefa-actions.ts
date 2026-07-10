"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { StatusTarefa } from "@prisma/client";

export async function createTarefaAction(_prevState: { error?: string }, formData: FormData) {
  const clienteId = formData.get("clienteId") as string;
  const titulo = formData.get("titulo") as string;

  if (!titulo) return { error: "Informe o título da tarefa" };

  await prisma.tarefa.create({
    data: { clienteId, titulo, status: "PENDENTE", iniciadoEm: new Date() },
  });

  revalidatePath(`/clientes/${clienteId}`);
  return {};
}

export async function updateTarefaStatusAction(
  tarefaId: string,
  clienteId: string,
  status: StatusTarefa
) {
  await prisma.tarefa.update({
    where: { id: tarefaId },
    data: {
      status,
      encerradoEm: status === "CONCLUIDA" ? new Date() : null,
    },
  });
  revalidatePath(`/clientes/${clienteId}`);
}
