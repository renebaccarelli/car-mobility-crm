"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { StatusTarefa } from "@prisma/client";

export async function createTarefaAction(_prevState: { error?: string }, formData: FormData) {
  const clienteId = formData.get("clienteId") as string;
  const titulo = formData.get("titulo") as string;

  if (!titulo) return { error: "Informe o título da tarefa" };

  const supabase = await createClient();
  const { error } = await supabase.from("tarefas").insert({
    clienteId,
    titulo,
    status: "PENDENTE",
    iniciadoEm: new Date().toISOString(),
  });

  if (error) {
    return { error: "Não foi possível criar a tarefa." };
  }

  revalidatePath(`/clientes/${clienteId}`);
  return {};
}

export async function updateTarefaStatusAction(
  tarefaId: string,
  clienteId: string,
  status: StatusTarefa
) {
  const supabase = await createClient();
  await supabase
    .from("tarefas")
    .update({
      status,
      encerradoEm: status === "CONCLUIDA" ? new Date().toISOString() : null,
    })
    .eq("id", tarefaId);

  revalidatePath(`/clientes/${clienteId}`);
}
