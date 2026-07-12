import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a service_role key — ignora RLS. Uso restrito a operações
 * privilegiadas do servidor: Storage, criação de usuários (admin.createUser),
 * e a busca de cliente por CPF+nascimento antes do login (magic link).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configurados no .env");
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
