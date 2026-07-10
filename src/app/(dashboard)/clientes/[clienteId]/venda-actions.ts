"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function createVendaAction(_prevState: { error?: string }, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const clienteId = formData.get("clienteId") as string;
  const empresaServicoIds = formData.getAll("empresaServicoIds") as string[];

  if (empresaServicoIds.length === 0) {
    return { error: "Selecione ao menos um serviço." };
  }

  const empresaServicos = await prisma.empresaServico.findMany({
    where: { id: { in: empresaServicoIds } },
    include: { servico: true },
  });

  const pedido = await prisma.pedido.create({
    data: {
      clienteId,
      itens: {
        create: empresaServicos.map((es) => ({
          servicoId: es.servicoId,
          valor: es.valor,
        })),
      },
    },
  });

  const nomesServicos = empresaServicos.map((es) => es.servico.nome).join(", ");
  await prisma.mensagem.create({
    data: {
      clienteId,
      autorId: session.usuarioId,
      categoria: "VENDAS",
      texto: `Nova venda criada por ${session.nome}:\n${nomesServicos}\nPedido: ${pedido.numero}`,
    },
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
  const item = await prisma.pedidoItem.update({
    where: { id: pedidoItemId },
    data: {
      pago,
      statusServico: pago ? "EM_ANDAMENTO" : "AGUARDANDO_CONFIRMACAO",
    },
  });

  if (pago) {
    await prisma.pagamento.create({
      data: { pedidoId: item.pedidoId, valor: item.valor },
    });
  }

  revalidatePath(`/clientes/${clienteId}`);
}
