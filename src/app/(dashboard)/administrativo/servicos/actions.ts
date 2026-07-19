"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const servicoSchema = z.object({
  nome: z.string().min(2, "Informe o nome do serviço"),
  categoria: z.enum(["RECOMENDADOS", "CNH", "LAUDOS", "ISENCOES"]),
  valorPadrao: z.coerce.number().positive("Informe um valor válido"),
  descricao: z.string().optional(),
});

export async function createServicoAction(_prevState: { error?: string }, formData: FormData) {
  const parsed = servicoSchema.safeParse({
    nome: formData.get("nome"),
    categoria: formData.get("categoria"),
    valorPadrao: formData.get("valorPadrao"),
    descricao: formData.get("descricao") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("servicos")
    .select("id")
    .eq("nome", parsed.data.nome)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe um serviço com esse nome." };
  }

  const { error } = await supabase.from("servicos").insert({
    nome: parsed.data.nome,
    categoria: parsed.data.categoria,
    valorPadrao: parsed.data.valorPadrao,
    descricao: parsed.data.descricao,
  });

  if (error) {
    return { error: "Você não tem permissão para cadastrar serviços." };
  }

  revalidatePath("/administrativo/servicos");
  return {};
}

export async function toggleServicoAtivoAction(servicoId: string, ativo: boolean) {
  const supabase = await createClient();
  await supabase.from("servicos").update({ ativo }).eq("id", servicoId);
  revalidatePath("/administrativo/servicos");
}

const editarServicoSchema = z.object({
  servicoId: z.string().min(1),
  nome: z.string().min(2, "Informe o nome do serviço"),
  categoria: z.enum(["RECOMENDADOS", "CNH", "LAUDOS", "ISENCOES"]),
  valorPadrao: z.coerce.number().positive("Informe um valor válido"),
  descricao: z.string().optional(),
});

export async function updateServicoAction(_prevState: { error?: string }, formData: FormData) {
  const parsed = editarServicoSchema.safeParse({
    servicoId: formData.get("servicoId"),
    nome: formData.get("nome"),
    categoria: formData.get("categoria"),
    valorPadrao: formData.get("valorPadrao"),
    descricao: formData.get("descricao") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { servicoId, nome, categoria, valorPadrao, descricao } = parsed.data;
  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("servicos")
    .select("id")
    .eq("nome", nome)
    .neq("id", servicoId)
    .maybeSingle();

  if (existente) {
    return { error: "Já existe um serviço com esse nome." };
  }

  const { error } = await supabase
    .from("servicos")
    .update({ nome, categoria, valorPadrao, descricao })
    .eq("id", servicoId);

  if (error) {
    return { error: "Não foi possível atualizar o serviço." };
  }

  revalidatePath("/administrativo/servicos");
  return {};
}

export async function deleteServicoAction(servicoId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("servicos").delete().eq("id", servicoId);

  if (error) {
    if (error.code === "23503") {
      return {
        error: "Não é possível remover: existem vendas usando este serviço. Desative-o em vez de remover.",
      };
    }
    return { error: "Não foi possível remover o serviço." };
  }

  revalidatePath("/administrativo/servicos");
}
