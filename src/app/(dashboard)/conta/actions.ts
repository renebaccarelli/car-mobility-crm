"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const senhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual"),
    novaSenha: z.string().min(6, "A nova senha precisa ter ao menos 6 caracteres"),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type AlterarSenhaState = {
  error?: string;
  sucesso?: boolean;
};

export async function alterarSenhaAction(
  _prevState: AlterarSenhaState,
  formData: FormData
): Promise<AlterarSenhaState> {
  const parsed = senhaSchema.safeParse({
    senhaAtual: formData.get("senhaAtual"),
    novaSenha: formData.get("novaSenha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Sessão inválida. Faça login novamente." };
  }

  // Reautentica com a senha atual antes de trocar — evita que uma sessão
  // esquecida aberta em outro lugar troque a senha sem confirmar a atual.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.senhaAtual,
  });

  if (reauthError) {
    return { error: "Senha atual incorreta." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.novaSenha,
  });

  if (updateError) {
    return { error: "Não foi possível alterar a senha. Tente novamente." };
  }

  return { sucesso: true };
}
