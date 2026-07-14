"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { createArquivoClienteUploadUrl, deleteArquivoCliente } from "@/lib/storage";

// Envio direto do navegador pro Storage (ver criarUploadUrlAction +
// registrarArquivoAction): evita o limite de tamanho de requisição das
// Server Actions/funções serverless, já que o arquivo não passa por aqui.
export async function criarUploadUrlAction(clienteId: string, fileName: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("id", clienteId)
    .maybeSingle();

  if (!cliente) {
    return { error: "Cliente não encontrado." };
  }

  try {
    const { path, token } = await createArquivoClienteUploadUrl(clienteId, fileName);
    return { path, token };
  } catch {
    return { error: "Não foi possível preparar o envio do arquivo." };
  }
}

export async function registrarArquivoAction(clienteId: string, path: string, nome: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase.from("arquivos_cliente").insert({
    clienteId,
    nome,
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
