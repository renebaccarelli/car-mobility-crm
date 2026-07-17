"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

const vendedorSchema = z
  .object({
    nome: z.string().min(2, "Informe o nome"),
    telefone: z.string().min(8, "Informe um telefone válido"),
    email: z.string().email("E-mail inválido"),
    senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
    perfil: z.enum(["ADMINISTRADOR", "VENDEDOR"]),
    concessionariaMarcaId: z.string().optional(),
  })
  .refine((data) => data.perfil !== "VENDEDOR" || Boolean(data.concessionariaMarcaId), {
    message: "Selecione a concessionária e a marca do vendedor.",
    path: ["concessionariaMarcaId"],
  });

export async function createVendedorAction(_prevState: { error?: string }, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.perfil !== "ADMINISTRADOR") {
    return { error: "Só administradores podem criar vendedores." };
  }

  const parsed = vendedorSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    perfil: formData.get("perfil"),
    concessionariaMarcaId: formData.get("concessionariaMarcaId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { nome, telefone, email, senha, perfil, concessionariaMarcaId } = parsed.data;

  const adminClient = createAdminClient();
  const { data: created, error } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, telefone, tipo: "vendedor" },
  });

  if (error || !created.user) {
    if (error?.code === "email_exists") {
      return { error: "Já existe uma conta com esse e-mail." };
    }
    return { error: "Não foi possível criar o usuário." };
  }

  // O trigger cria a linha em usuarios com perfil VENDEDOR; ajustamos aqui
  // caso o administrador tenha escolhido criar outro administrador, ou
  // vinculamos a unidade concessionária+marca escolhida.
  if (perfil === "ADMINISTRADOR") {
    await adminClient.from("usuarios").update({ perfil: "ADMINISTRADOR" }).eq("id", created.user.id);
  } else {
    await adminClient
      .from("usuarios")
      .update({ concessionariaMarcaId })
      .eq("id", created.user.id);
  }

  revalidatePath("/administrativo/vendedores");
  return {};
}

export async function toggleVendedorAtivoAction(usuarioId: string, ativo: boolean) {
  const supabase = await createClient();
  await supabase.from("usuarios").update({ ativo }).eq("id", usuarioId);
  revalidatePath("/administrativo/vendedores");
}

const editarVendedorSchema = z
  .object({
    usuarioId: z.string().min(1),
    nome: z.string().min(2, "Informe o nome"),
    telefone: z.string().min(8, "Informe um telefone válido"),
    email: z.string().email("E-mail inválido"),
    perfil: z.enum(["ADMINISTRADOR", "VENDEDOR"]),
    concessionariaMarcaId: z.string().optional(),
  })
  .refine((data) => data.perfil !== "VENDEDOR" || Boolean(data.concessionariaMarcaId), {
    message: "Selecione a concessionária e a marca do vendedor.",
    path: ["concessionariaMarcaId"],
  });

export async function updateVendedorAction(_prevState: { error?: string }, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.perfil !== "ADMINISTRADOR") {
    return { error: "Só administradores podem editar vendedores." };
  }

  const parsed = editarVendedorSchema.safeParse({
    usuarioId: formData.get("usuarioId"),
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    perfil: formData.get("perfil"),
    concessionariaMarcaId: formData.get("concessionariaMarcaId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { usuarioId, nome, telefone, email, perfil, concessionariaMarcaId } = parsed.data;
  const adminClient = createAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(usuarioId, { email });
  if (authError) {
    if (authError.code === "email_exists") {
      return { error: "Já existe uma conta com esse e-mail." };
    }
    return { error: "Não foi possível atualizar o e-mail do vendedor." };
  }

  const { error } = await adminClient
    .from("usuarios")
    .update({
      nome,
      telefone,
      email,
      perfil,
      concessionariaMarcaId: perfil === "VENDEDOR" ? concessionariaMarcaId : null,
    })
    .eq("id", usuarioId);

  if (error) {
    return { error: "Não foi possível atualizar os dados do vendedor." };
  }

  revalidatePath("/administrativo/vendedores");
  return {};
}
