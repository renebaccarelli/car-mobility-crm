import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
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

  const [template, cliente] = await Promise.all([
    prisma.documentoTemplate.findUnique({ where: { id: templateId } }),
    prisma.cliente.findUnique({ where: { id: clienteId }, include: { endereco: true } }),
  ]);

  if (!template || !cliente) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const templateBuffer = await downloadDocumentoTemplate(template.url);
  const merged = mergeDocxTemplate(templateBuffer, clienteParaPlaceholders(cliente));

  return new NextResponse(new Uint8Array(merged), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${template.nome}.docx"`,
    },
  });
}
