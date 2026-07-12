"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PortalLoginState = {
  error?: string;
  sucesso?: boolean;
};

const emailSchema = z.object({ email: z.string().email("E-mail inválido") });

export async function solicitarLinkPorEmailAction(
  _prevState: PortalLoginState,
  formData: FormData
): Promise<PortalLoginState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Informe um e-mail válido." };
  }

  const adminClient = createAdminClient();
  const { data: cliente } = await adminClient
    .from("clientes")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  // Mesma mensagem tanto se achar quanto se não achar, para não vazar dados.
  if (cliente) {
    const supabase = await createClient();
    await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { shouldCreateUser: true },
    });
  }

  return { sucesso: true };
}

const cpfSchema = z.object({
  cpf: z.string().min(11, "Informe um CPF válido"),
  dataNascimento: z.string().min(1, "Informe a data de nascimento"),
});

export async function solicitarLinkPorCpfAction(
  _prevState: PortalLoginState,
  formData: FormData
): Promise<PortalLoginState> {
  const parsed = cpfSchema.safeParse({
    cpf: formData.get("cpf"),
    dataNascimento: formData.get("dataNascimento"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const cpfLimpo = parsed.data.cpf.replace(/\D/g, "");
  const adminClient = createAdminClient();

  const { data: clientes } = await adminClient
    .from("clientes")
    .select("email, cpf, dataNascimento")
    .eq("dataNascimento", new Date(parsed.data.dataNascimento).toISOString());

  const cliente = (clientes ?? []).find((c) => (c.cpf ?? "").replace(/\D/g, "") === cpfLimpo);

  if (cliente?.email) {
    const supabase = await createClient();
    await supabase.auth.signInWithOtp({
      email: cliente.email,
      options: { shouldCreateUser: true },
    });
  }

  // Mesma mensagem tanto se achar quanto se não achar, para não vazar dados.
  return { sucesso: true };
}
