import "server-only";
import { createClient } from "@/lib/supabase/server";

export type SessionPayload = {
  usuarioId: string;
  nome: string;
  email: string;
  perfil: "ADMINISTRADOR" | "VENDEDOR" | "CONCESSIONARIA";
};

export async function getSession(): Promise<SessionPayload | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id, nome, email, perfil, ativo")
    .eq("id", user.id)
    .maybeSingle();

  if (!usuario || !usuario.ativo) return null;

  return {
    usuarioId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
  };
}

export async function destroySession() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
