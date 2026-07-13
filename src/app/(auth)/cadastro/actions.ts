"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const cadastroSchema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  telefone: z.string().min(8, "Informe um telefone válido"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
});

export type CadastroState = {
  error?: string;
  sucesso?: boolean;
};

export async function cadastroVendedorAction(
  _prevState: CadastroState,
  formData: FormData
): Promise<CadastroState> {
  const parsed = cadastroSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { nome, telefone, email, senha } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, telefone, tipo: "vendedor" } },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "Já existe uma conta com esse e-mail." };
    }
    if (error.code === "over_email_send_rate_limit") {
      return {
        error:
          "Limite de envio de e-mails atingido no momento. Aguarde alguns minutos e tente novamente.",
      };
    }
    return { error: "Não foi possível concluir o cadastro. Tente novamente." };
  }

  return { sucesso: true };
}
