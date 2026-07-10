"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import type { MetodoPagamento, TipoPerfil } from "@prisma/client";

const grupoSchema = z.object({
  nome: z.string().min(2, "Informe o nome do grupo"),
});

export async function createGrupoAction(_prevState: { error?: string }, formData: FormData) {
  const parsed = grupoSchema.safeParse({ nome: formData.get("nome") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.grupo.create({ data: { nome: parsed.data.nome } });
  revalidatePath("/cadastros");
  return {};
}

export async function toggleGrupoAtivoAction(grupoId: string, ativo: boolean) {
  await prisma.grupo.update({ where: { id: grupoId }, data: { ativo } });
  revalidatePath("/cadastros");
}

const empresaSchema = z.object({
  grupoId: z.string().min(1),
  nome: z.string().min(2, "Informe o nome da empresa"),
  cnpj: z.string().optional(),
  marca: z.string().optional(),
});

export async function createEmpresaAction(_prevState: { error?: string }, formData: FormData) {
  const parsed = empresaSchema.safeParse({
    grupoId: formData.get("grupoId"),
    nome: formData.get("nome"),
    cnpj: formData.get("cnpj") || undefined,
    marca: formData.get("marca") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { grupoId, ...data } = parsed.data;
  const empresa = await prisma.empresa.create({
    data: { ...data, grupoId },
  });

  const metodos: MetodoPagamento[] = [
    "CREDITO",
    "BOLETO",
    "DEBITO",
    "TEF_DOC_TRANSFERENCIA_PIX",
    "NF_CONCESSIONARIA",
    "DINHEIRO",
    "DEPOSITO",
    "CHEQUE",
  ];
  await prisma.empresaMetodoPagamento.createMany({
    data: metodos.map((metodo) => ({ empresaId: empresa.id, metodo, ativo: false })),
  });

  revalidatePath(`/cadastros/${grupoId}`);
  return {};
}

export async function toggleEmpresaAtivaAction(empresaId: string, grupoId: string, ativo: boolean) {
  await prisma.empresa.update({ where: { id: empresaId }, data: { ativo } });
  revalidatePath(`/cadastros/${grupoId}`);
}

const usuarioSchema = z.object({
  empresaId: z.string().min(1),
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
  perfil: z.enum(["ADMINISTRADOR", "GERENTE", "VENDEDOR", "COLABORADOR", "CLIENTE"]),
});

export async function createUsuarioAction(_prevState: { error?: string }, formData: FormData) {
  const parsed = usuarioSchema.safeParse({
    empresaId: formData.get("empresaId"),
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    perfil: formData.get("perfil"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existente = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  if (existente) {
    return { error: "Já existe um usuário com esse e-mail." };
  }

  const senhaHash = await hashPassword(parsed.data.senha);
  await prisma.usuario.create({
    data: {
      nome: parsed.data.nome,
      email: parsed.data.email,
      perfil: parsed.data.perfil as TipoPerfil,
      senhaHash,
      empresaId: parsed.data.empresaId,
    },
  });

  revalidatePath(`/cadastros/empresa/${parsed.data.empresaId}`);
  return {};
}

export async function toggleUsuarioAtivoAction(usuarioId: string, empresaId: string, ativo: boolean) {
  await prisma.usuario.update({ where: { id: usuarioId }, data: { ativo } });
  revalidatePath(`/cadastros/empresa/${empresaId}`);
}

export async function toggleMetodoPagamentoAction(id: string, empresaId: string, ativo: boolean) {
  await prisma.empresaMetodoPagamento.update({ where: { id }, data: { ativo } });
  revalidatePath(`/cadastros/empresa/${empresaId}`);
}

export async function updateEmpresaServicoValorAction(
  id: string,
  empresaId: string,
  valor: number
) {
  await prisma.empresaServico.update({ where: { id }, data: { valor } });
  revalidatePath(`/cadastros/empresa/${empresaId}`);
}

export async function toggleEmpresaServicoAction(
  id: string,
  empresaId: string,
  data: { ativo?: boolean; empresaPodePagar?: boolean }
) {
  await prisma.empresaServico.update({ where: { id }, data });
  revalidatePath(`/cadastros/empresa/${empresaId}`);
}
