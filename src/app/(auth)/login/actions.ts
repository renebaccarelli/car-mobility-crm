"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const loginSchema = z.object({
  identificador: z.string().min(1, "Informe o e-mail ou usuário"),
  senha: z.string().min(1, "Informe a senha"),
  redirectTo: z.string().optional(),
});

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    identificador: formData.get("identificador"),
    senha: formData.get("senha"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) {
    return { error: "Preencha e-mail/usuário e senha corretamente." };
  }

  const { identificador, senha, redirectTo } = parsed.data;

  let email = identificador;

  // Login por usuário (sem @): resolve o e-mail interno correspondente via
  // service role, já que ainda não existe sessão pra consultar com RLS.
  if (!identificador.includes("@")) {
    const adminClient = createAdminClient();
    const { data: usuario } = await adminClient
      .from("usuarios")
      .select("email")
      .eq("username", identificador.trim().toLowerCase())
      .maybeSingle();

    if (!usuario) {
      return { error: "E-mail/usuário ou senha inválidos." };
    }
    email = usuario.email;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return { error: "E-mail/usuário ou senha inválidos." };
  }

  redirect(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/inicio");
}
