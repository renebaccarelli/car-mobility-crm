"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { isValidCpf } from "@/lib/cpf";

function friendlyClienteError(error: { code?: string; message?: string } | null, fallback: string) {
  if (error?.code === "23505") {
    if (error.message?.includes("clientes_cpf_key")) {
      return "Já existe um cliente cadastrado com esse CPF.";
    }
    if (error.message?.includes("clientes_email_key")) {
      return "Já existe um cliente cadastrado com esse e-mail.";
    }
  }
  return fallback;
}

const cpfField = z
  .string()
  .optional()
  .refine((value) => !value || isValidCpf(value), "CPF inválido");

const clienteSchema = z.object({
  nome: z.string().min(2, "Informe o nome do cliente"),
  dataNascimento: z.string().optional(),
  cpf: cpfField,
  whatsapp: z.string().optional(),
  telefone: z.string().min(1, "Informe o telefone principal"),
  condutor: z.enum(["sim", "nao"]).optional(),
  preferenciaContato: z.enum(["TELEFONE", "WHATSAPP"]).optional(),
  etapaAtual: z.string().optional(),
});

export async function createClienteAction(_prevState: { error?: string }, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const parsed = clienteSchema.safeParse({
    nome: formData.get("nome"),
    dataNascimento: formData.get("dataNascimento") || undefined,
    cpf: formData.get("cpf") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    telefone: formData.get("telefone"),
    condutor: formData.get("condutor") || undefined,
    preferenciaContato: formData.get("preferenciaContato") || undefined,
    etapaAtual: formData.get("etapaAtual") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { data: cliente, error } = await supabase
    .from("clientes")
    .insert({
      nome: data.nome,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento).toISOString() : null,
      cpf: data.cpf,
      whatsapp: data.whatsapp,
      telefone: data.telefone,
      condutor: data.condutor === "sim",
      preferenciaContato: data.preferenciaContato ?? null,
      etapaAtual: data.etapaAtual ?? "NAO_SE_APLICA",
      cadastradoPorId: session.usuarioId,
    })
    .select("id")
    .single();

  if (error || !cliente) {
    return { error: friendlyClienteError(error, "Não foi possível cadastrar o cliente.") };
  }

  await supabase.from("mensagens").insert({
    clienteId: cliente.id,
    autorId: session.usuarioId,
    categoria: "CADASTRO",
    texto: `Cadastro do cliente efetuado por ${session.nome}`,
  });

  revalidatePath("/leads");
  revalidatePath("/clientes");
  return {};
}

const triEstadoField = z.enum(["sim", "nao", ""]).optional();

const updateClienteSchema = z.object({
  clienteId: z.string().min(1),
  nome: z.string().min(2),
  cpf: cpfField,
  cnh: z.string().optional(),
  dataNascimento: z.string().optional(),
  whatsapp: z.string().optional(),
  telefone: z.string().optional(),
  preferenciaContato: z.enum(["TELEFONE", "WHATSAPP"]).optional(),
  condutor: z.enum(["sim", "nao"]).optional(),
  deficienciaMembrosInferiores: triEstadoField,
});

export async function updateClienteAction(_prevState: { error?: string }, formData: FormData) {
  const parsed = updateClienteSchema.safeParse({
    clienteId: formData.get("clienteId"),
    nome: formData.get("nome"),
    cpf: formData.get("cpf") || undefined,
    cnh: formData.get("cnh") || undefined,
    dataNascimento: formData.get("dataNascimento") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    telefone: formData.get("telefone") || undefined,
    preferenciaContato: formData.get("preferenciaContato") || undefined,
    condutor: formData.get("condutor") || undefined,
    deficienciaMembrosInferiores: formData.get("deficienciaMembrosInferiores") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { clienteId, deficienciaMembrosInferiores, condutor, dataNascimento, ...data } =
    parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("clientes")
    .update({
      ...data,
      preferenciaContato: data.preferenciaContato ?? null,
      condutor: condutor === "sim",
      deficienciaMembrosInferiores:
        deficienciaMembrosInferiores === "" ? null : deficienciaMembrosInferiores === "sim",
      dataNascimento: dataNascimento ? new Date(dataNascimento).toISOString() : null,
    })
    .eq("id", clienteId);

  if (error) {
    return {
      error: friendlyClienteError(error, "Você não tem permissão para editar este cliente."),
    };
  }

  revalidatePath(`/clientes/${clienteId}`);
  return {};
}

export async function updateEtapaAction(clienteId: string, etapaAtual: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();
  await supabase.from("clientes").update({ etapaAtual }).eq("id", clienteId);
  revalidatePath(`/clientes/${clienteId}`);
}

export async function addCondutorAction(_prevState: { error?: string }, formData: FormData) {
  const clienteId = formData.get("clienteId") as string;
  const nome = formData.get("nome") as string;
  const cpf = (formData.get("cpf") as string) || undefined;
  const cnh = (formData.get("cnh") as string) || undefined;

  if (!nome) return { error: "Informe o nome do condutor" };
  if (cpf && !isValidCpf(cpf)) return { error: "CPF inválido" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("condutores_autorizados")
    .insert({ clienteId, nome, cpf, cnh });

  if (error) {
    return { error: "Não foi possível adicionar o condutor." };
  }

  revalidatePath(`/clientes/${clienteId}`);
  return {};
}

export async function addMensagemAction(clienteId: string, texto: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!texto.trim()) return;

  const supabase = await createClient();
  await supabase
    .from("mensagens")
    .insert({ clienteId, texto, autorId: session.usuarioId, categoria: "GERAL" });

  revalidatePath(`/clientes/${clienteId}`);
}
