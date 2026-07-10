"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
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

  await prisma.arquivoCliente.create({
    data: {
      clienteId,
      nome: file.name,
      url: path,
      enviadoPorId: session.usuarioId,
    },
  });

  revalidatePath(`/clientes/${clienteId}`);
  return {};
}

export async function deleteArquivoAction(arquivoId: string, clienteId: string) {
  const arquivo = await prisma.arquivoCliente.findUnique({ where: { id: arquivoId } });
  if (!arquivo) return;

  await deleteArquivoCliente(arquivo.url);
  await prisma.arquivoCliente.delete({ where: { id: arquivoId } });
  revalidatePath(`/clientes/${clienteId}`);
}
