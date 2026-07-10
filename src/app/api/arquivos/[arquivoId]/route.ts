import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getArquivoClienteUrl } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ arquivoId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { arquivoId } = await params;
  const arquivo = await prisma.arquivoCliente.findUnique({ where: { id: arquivoId } });

  if (!arquivo) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const signedUrl = await getArquivoClienteUrl(arquivo.url);
  return NextResponse.redirect(signedUrl);
}
