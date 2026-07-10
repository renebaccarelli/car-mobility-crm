"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { CategoriaServico } from "@prisma/client";

const servicoSchema = z.object({
  nome: z.string().min(2, "Informe o nome do serviço"),
  categoria: z.enum(["RECOMENDADOS", "CNH", "LAUDOS", "ISENCOES"]),
  valorPadrao: z.coerce.number().positive("Informe um valor válido"),
  descricao: z.string().optional(),
});

export async function createServicoAction(_prevState: { error?: string }, formData: FormData) {
  const parsed = servicoSchema.safeParse({
    nome: formData.get("nome"),
    categoria: formData.get("categoria"),
    valorPadrao: formData.get("valorPadrao"),
    descricao: formData.get("descricao") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existente = await prisma.servico.findUnique({ where: { nome: parsed.data.nome } });
  if (existente) {
    return { error: "Já existe um serviço com esse nome." };
  }

  const servico = await prisma.servico.create({
    data: {
      nome: parsed.data.nome,
      categoria: parsed.data.categoria as CategoriaServico,
      valorPadrao: parsed.data.valorPadrao,
      descricao: parsed.data.descricao,
    },
  });

  const empresas = await prisma.empresa.findMany({ select: { id: true } });
  await prisma.empresaServico.createMany({
    data: empresas.map((empresa) => ({
      empresaId: empresa.id,
      servicoId: servico.id,
      valor: parsed.data.valorPadrao,
      ativo: true,
      empresaPodePagar: false,
    })),
  });

  revalidatePath("/administrativo/servicos");
  return {};
}

export async function toggleServicoAtivoAction(servicoId: string, ativo: boolean) {
  await prisma.servico.update({ where: { id: servicoId }, data: { ativo } });
  revalidatePath("/administrativo/servicos");
}

export async function updateEmpresaServicoAction(_prevState: { error?: string }, formData: FormData) {
  const empresaServicoId = formData.get("empresaServicoId") as string;
  const empresaId = formData.get("empresaId") as string;
  const valor = Number(formData.get("valor"));
  const empresaPodePagar = formData.get("empresaPodePagar") === "on";

  if (!empresaServicoId || Number.isNaN(valor) || valor <= 0) {
    return { error: "Informe um valor válido" };
  }

  await prisma.empresaServico.update({
    where: { id: empresaServicoId },
    data: { valor, empresaPodePagar },
  });

  revalidatePath(`/cadastros/empresa/${empresaId}`);
  return {};
}
