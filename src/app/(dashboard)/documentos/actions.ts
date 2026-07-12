"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase.from("documento_templates").insert({ nome, url: path });

  if (error) {
    return { error: "Você não tem permissão para cadastrar documentos." };
  }

  revalidatePath("/documentos");
  return {};
}

export async function deleteDocumentoTemplateAction(id: string) {
  const supabase = await createClient();
  await supabase.from("documento_templates").delete().eq("id", id);
  revalidatePath("/documentos");
}
