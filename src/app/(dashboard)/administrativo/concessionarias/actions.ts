"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";

const concessionariaSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  telefone: z.string().min(8, "Informe um telefone válido"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
  marcaIds: z.array(z.string().min(1)).min(1, "Selecione ao menos uma marca"),
});

export async function createConcessionariaAction(
  _prevState: { error?: string },
  formData: FormData
) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.perfil !== "ADMINISTRADOR") {
    return { error: "Só administradores podem criar concessionárias." };
  }

  const parsed = concessionariaSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    marcaIds: formData.getAll("marcaIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { nome, telefone, email, senha, marcaIds } = parsed.data;
  const supabase = await createClient();

  const { data: concessionaria, error: concessionariaError } = await supabase
    .from("concessionarias")
    .insert({ nome, telefone })
    .select("id")
    .single();

  if (concessionariaError || !concessionaria) {
    return { error: "Não foi possível cadastrar a concessionária." };
  }

  const { error: unidadesError } = await supabase.from("concessionaria_marcas").insert(
    marcaIds.map((marcaId) => ({
      concessionariaId: concessionaria.id,
      marcaId,
    }))
  );

  if (unidadesError) {
    return { error: "Não foi possível associar as marcas selecionadas." };
  }

  const adminClient = createAdminClient();
  // O trigger handle_new_user só cria a linha em usuarios quando tipo=vendedor;
  // criamos assim e depois trocamos o perfil para CONCESSIONARIA (mesmo truque
  // usado em createVendedorAction para criar um ADMINISTRADOR).
  const { data: created, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, telefone, tipo: "vendedor" },
  });

  if (authError || !created.user) {
    if (authError?.code === "email_exists") {
      return { error: "Já existe uma conta com esse e-mail." };
    }
    return { error: "Não foi possível criar o login da concessionária." };
  }

  const { data: updated, error: updateError } = await adminClient
    .from("usuarios")
    .update({ perfil: "CONCESSIONARIA", concessionariaId: concessionaria.id })
    .eq("id", created.user.id)
    .select("id");

  if (updateError || !updated || updated.length === 0) {
    return { error: "Concessionária criada, mas não foi possível vincular o login." };
  }

  revalidatePath("/administrativo/concessionarias");
  return {};
}

export async function toggleConcessionariaAtivoAction(concessionariaId: string, ativo: boolean) {
  const supabase = await createClient();
  await supabase.from("concessionarias").update({ ativo }).eq("id", concessionariaId);
  revalidatePath("/administrativo/concessionarias");
}
