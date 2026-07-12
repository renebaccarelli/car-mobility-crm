"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { deleteArquivoCliente, uploadArquivoCliente } from "@/lib/storage";

export async function uploadArquivoAction(_prevState: { error?: string }, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const clienteId = formData.get("clienteId") as string;
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "Selecione um arquivo" };
  }

  const path = await uploadArquivoCliente(clienteId, file);

  const supabase = await createClient();
  const { error } = await supabase.from("arquivos_cliente").insert({
    clienteId,
    nome: file.name,
    url: path,
    enviadoPorId: session.usuarioId,
  });

  if (error) {
    return { error: "Não foi possível registrar o arquivo." };
  }

  revalidatePath(`/clientes/${clienteId}`);
  return {};
}

export async function deleteArquivoAction(arquivoId: string, clienteId: string) {
  const supabase = await createClient();
  const { data: arquivo } = await supabase
    .from("arquivos_cliente")
    .select("url")
    .eq("id", arquivoId)
    .maybeSingle();

  if (!arquivo) return;

  await deleteArquivoCliente(arquivo.url);
  await supabase.from("arquivos_cliente").delete().eq("id", arquivoId);
  revalidatePath(`/clientes/${clienteId}`);
}
