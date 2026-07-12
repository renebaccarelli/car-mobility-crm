import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Se for a primeira vez que esse e-mail loga, vincula ao registro do
      // cliente correspondente (clientes.userId).
      await supabase.rpc("link_cliente_to_current_user");

      redirectTo.pathname = "/portal";
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/portal/login";
  return NextResponse.redirect(redirectTo);
}
