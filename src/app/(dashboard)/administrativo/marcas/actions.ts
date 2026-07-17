"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const marcaSchema = z.object({
  nome: z.string().min(2, "Informe o nome da marca"),
});

export async function createMarcaAction(_prevState: { error?: string }, formData: FormData) {
  const parsed = marcaSchema.safeParse({
    nome: formData.get("nome"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("marcas")
    .select("id")
    .eq("nome", parsed.data.nome)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe uma marca com esse nome." };
  }

  const { error } = await supabase.from("marcas").insert({
    nome: parsed.data.nome,
  });

  if (error) {
    return { error: "Você não tem permissão para cadastrar marcas." };
  }

  revalidatePath("/administrativo/marcas");
  return {};
}

export async function toggleMarcaAtivoAction(marcaId: string, ativo: boolean) {
  const supabase = await createClient();
  await supabase.from("marcas").update({ ativo }).eq("id", marcaId);
  revalidatePath("/administrativo/marcas");
}
