"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { uploadDocumentoTemplate } from "@/lib/storage";

export async function createDocumentoTemplateAction(
  _prevState: { error?: string },
  formData: FormData
) {
  const nome = formData.get("nome") as string;
  const file = formData.get("file") as File | null;

  if (!nome) return { error: "Informe o nome do documento" };
  if (!file || file.size === 0) return { error: "Selecione um arquivo .docx" };

  const path = await uploadDocumentoTemplate(file);

  await prisma.documentoTemplate.create({
    data: { nome, url: path },
  });

  revalidatePath("/documentos");
  return {};
}

export async function deleteDocumentoTemplateAction(id: string) {
  await prisma.documentoTemplate.delete({ where: { id } });
  revalidatePath("/documentos");
}
