"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";

export async function createVendaAction(_prevState: { error?: string }, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.perfil !== "ADMINISTRADOR") {
    return { error: "Só administradores podem atribuir serviços." };
  }

  const clienteId = formData.get("clienteId") as string;
  const servicoIds = formData.getAll("servicoIds") as string[];

  if (servicoIds.length === 0) {
    return { error: "Selecione ao menos um serviço." };
  }

  const supabase = await createClient();

  const { data: servicos } = await supabase
    .from("servicos")
    .select("id, nome, valorPadrao")
    .in("id", servicoIds);

  if (!servicos || servicos.length === 0) {
    return { error: "Serviços não encontrados." };
  }

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .insert({ clienteId })
    .select("id, numero")
    .single();

  if (pedidoError || !pedido) {
    return { error: "Não foi possível criar a venda." };
  }

  const { error: itensError } = await supabase.from("pedido_itens").insert(
    servicos.map((s) => ({
      pedidoId: pedido.id,
      servicoId: s.id,
      valor: s.valorPadrao,
    }))
  );

  if (itensError) {
    return { error: "Não foi possível salvar os serviços da venda." };
  }

  const nomesServicos = servicos.map((s) => s.nome).join(", ");
  await supabase.from("mensagens").insert({
    clienteId,
    autorId: session.usuarioId,
    categoria: "VENDAS",
    texto: `Nova venda criada por ${session.nome}:\n${nomesServicos}\nPedido: ${pedido.numero}`,
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/clientes");
  revalidatePath("/leads");
  return {};
}

export async function togglePedidoItemPagoAction(
  pedidoItemId: string,
  clienteId: string,
  pago: boolean
) {
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from("pedido_itens")
    .update({
      pago,
      statusServico: pago ? "EM_ANDAMENTO" : "AGUARDANDO_CONFIRMACAO",
    })
    .eq("id", pedidoItemId)
    .select("pedidoId, valor")
    .single();

  if (!error && item && pago) {
    await supabase.from("pagamentos").insert({ pedidoId: item.pedidoId, valor: item.valor });
  }

  revalidatePath(`/clientes/${clienteId}`);
}
