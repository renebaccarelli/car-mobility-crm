import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { downloadDocumentoTemplate } from "@/lib/storage";
import { clienteParaPlaceholders, mergeDocxTemplate } from "@/lib/docx-merge";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const templateId = request.nextUrl.searchParams.get("templateId");
  const clienteId = request.nextUrl.searchParams.get("clienteId");

  if (!templateId || !clienteId) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const supabase = await createClient();

  const [{ data: template }, { data: cliente }] = await Promise.all([
    supabase.from("documento_templates").select("*").eq("id", templateId).maybeSingle(),
    supabase
      .from("clientes")
      .select("*, endereco:enderecos(*)")
      .eq("id", clienteId)
      .maybeSingle(),
  ]);

  if (!template || !cliente) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const templateBuffer = await downloadDocumentoTemplate(template.url);
  const merged = mergeDocxTemplate(
    templateBuffer,
    clienteParaPlaceholders({
      ...cliente,
      endereco: Array.isArray(cliente.endereco) ? (cliente.endereco[0] ?? null) : cliente.endereco,
    })
  );

  return new NextResponse(new Uint8Array(merged), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${template.nome}.docx"`,
    },
  });
}
