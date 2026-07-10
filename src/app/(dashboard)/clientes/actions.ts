"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { EtapaProcesso, PreferenciaContato } from "@prisma/client";

const clienteSchema = z.object({
  empresaId: z.string().min(1, "Selecione a concessionária"),
  nome: z.string().min(2, "Informe o nome do cliente"),
  dataNascimento: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  whatsapp: z.string().optional(),
  telefone: z.string().min(1, "Informe o telefone principal"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  condutor: z.enum(["sim", "nao"]).optional(),
  preferenciaContato: z.enum(["TELEFONE", "WHATSAPP", "EMAIL"]).optional(),
  etapaAtual: z.string().optional(),
  indicadoPor: z.string().optional(),
});

export async function createClienteAction(_prevState: { error?: string }, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const parsed = clienteSchema.safeParse({
    empresaId: formData.get("empresaId"),
    nome: formData.get("nome"),
    dataNascimento: formData.get("dataNascimento") || undefined,
    cpf: formData.get("cpf") || undefined,
    rg: formData.get("rg") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    telefone: formData.get("telefone"),
    email: formData.get("email") || undefined,
    condutor: formData.get("condutor") || undefined,
    preferenciaContato: formData.get("preferenciaContato") || undefined,
    etapaAtual: formData.get("etapaAtual") || undefined,
    indicadoPor: formData.get("indicadoPor") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;

  const cliente = await prisma.cliente.create({
    data: {
      empresaId: data.empresaId,
      nome: data.nome,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined,
      cpf: data.cpf,
      rg: data.rg,
      whatsapp: data.whatsapp,
      telefone: data.telefone,
      email: data.email || undefined,
      condutor: data.condutor === "sim",
      preferenciaContato: data.preferenciaContato as PreferenciaContato | undefined,
      etapaAtual: (data.etapaAtual as EtapaProcesso | undefined) ?? "NAO_SE_APLICA",
      indicadoPor: data.indicadoPor,
      cadastradoPorId: session.usuarioId,
      consultorId: session.usuarioId,
    },
  });

  await prisma.mensagem.create({
    data: {
      clienteId: cliente.id,
      autorId: session.usuarioId,
      categoria: "CADASTRO",
      texto: `Cadastro do cliente efetuado por ${session.nome}`,
    },
  });

  revalidatePath("/leads");
  revalidatePath("/clientes");
  return {};
}

const updateClienteSchema = z.object({
  clienteId: z.string().min(1),
  nome: z.string().min(2),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  cnh: z.string().optional(),
  whatsapp: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  preferenciaContato: z.enum(["TELEFONE", "WHATSAPP", "EMAIL"]).optional(),
});

export async function updateClienteAction(_prevState: { error?: string }, formData: FormData) {
  const parsed = updateClienteSchema.safeParse({
    clienteId: formData.get("clienteId"),
    nome: formData.get("nome"),
    cpf: formData.get("cpf") || undefined,
    rg: formData.get("rg") || undefined,
    cnh: formData.get("cnh") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    telefone: formData.get("telefone") || undefined,
    email: formData.get("email") || undefined,
    preferenciaContato: formData.get("preferenciaContato") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { clienteId, ...data } = parsed.data;

  await prisma.cliente.update({
    where: { id: clienteId },
    data: {
      ...data,
      email: data.email || null,
      preferenciaContato: data.preferenciaContato as PreferenciaContato | undefined,
    },
  });

  revalidatePath(`/clientes/${clienteId}`);
  return {};
}

export async function updateEtapaAction(clienteId: string, etapaAtual: EtapaProcesso) {
  const session = await getSession();
  if (!session) redirect("/login");

  await prisma.cliente.update({ where: { id: clienteId }, data: { etapaAtual } });
  revalidatePath(`/clientes/${clienteId}`);
}

export async function addCondutorAction(_prevState: { error?: string }, formData: FormData) {
  const clienteId = formData.get("clienteId") as string;
  const nome = formData.get("nome") as string;
  const cpf = (formData.get("cpf") as string) || undefined;
  const cnh = (formData.get("cnh") as string) || undefined;

  if (!nome) return { error: "Informe o nome do condutor" };

  await prisma.condutorAutorizado.create({ data: { clienteId, nome, cpf, cnh } });
  revalidatePath(`/clientes/${clienteId}`);
  return {};
}

export async function addMensagemAction(clienteId: string, texto: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!texto.trim()) return;

  await prisma.mensagem.create({
    data: { clienteId, texto, autorId: session.usuarioId, categoria: "GERAL" },
  });
  revalidatePath(`/clientes/${clienteId}`);
}
