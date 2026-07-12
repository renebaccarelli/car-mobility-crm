import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getArquivoClienteUrl } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ arquivoId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { arquivoId } = await params;
  // A consulta já sai filtrada pelo RLS: só retorna o arquivo se o usuário
  // atual for admin, o vendedor dono do cliente, ou o próprio cliente.
  const { data: arquivo } = await supabase
    .from("arquivos_cliente")
    .select("url")
    .eq("id", arquivoId)
    .maybeSingle();

  if (!arquivo) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const signedUrl = await getArquivoClienteUrl(arquivo.url);
  return NextResponse.redirect(signedUrl);
}
