import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ETAPA_PROCESSO_LABELS, ETAPA_PROCESSO_ORDEM } from "@/lib/labels";
import { UploadArquivoForm } from "@/app/(dashboard)/clientes/[clienteId]/upload-arquivo-form";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: cliente } = await supabase
    .from("clientes")
    .select(
      `*,
      pedidos(*, pedido_itens(*, servicos(nome))),
      tarefas(*),
      arquivos:arquivos_cliente(*)`
    )
    .eq("userId", user?.id ?? "")
    .maybeSingle();

  if (!cliente) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Nenhum caso encontrado para a sua conta ainda. Entre em contato com quem cadastrou seu
          atendimento.
        </CardContent>
      </Card>
    );
  }

  type PedidoItemRow = { id: string; valor: number; pago: boolean; servicos: { nome: string } };

  const indiceAtual = ETAPA_PROCESSO_ORDEM.indexOf(cliente.etapaAtual);
  const servicosContratados: PedidoItemRow[] = (cliente.pedidos ?? []).flatMap(
    (pedido: { pedido_itens: PedidoItemRow[] }) => pedido.pedido_itens
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Olá, {cliente.nome.split(" ")[0]}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap overflow-hidden rounded-lg border">
            {ETAPA_PROCESSO_ORDEM.map((etapa, index) => (
              <div
                key={etapa}
                className={`border-r px-3 py-2 text-xs font-medium whitespace-nowrap last:border-r-0 ${
                  index <= indiceAtual
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {ETAPA_PROCESSO_LABELS[etapa]}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Serviços</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicosContratados.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.servicos.nome}</TableCell>
                  <TableCell>{formatarMoeda(Number(item.valor))}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {item.pago ? "Em andamento" : "Aguardando confirmação"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {servicosContratados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhum serviço contratado ainda.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tarefas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(cliente.tarefas ?? []).map((tarefa: { id: string; titulo: string; status: string }) => (
            <div key={tarefa.id} className="flex items-center justify-between text-sm">
              <span>{tarefa.titulo}</span>
              <Badge variant="outline">{tarefa.status}</Badge>
            </div>
          ))}
          {(cliente.tarefas ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa registrada.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <UploadArquivoForm clienteId={cliente.id} />
          <ul className="space-y-1">
            {(cliente.arquivos ?? []).map((arquivo: { id: string; nome: string }) => (
              <li key={arquivo.id} className="text-sm">
                <a
                  href={`/api/arquivos/${arquivo.id}`}
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  {arquivo.nome}
                </a>
              </li>
            ))}
            {(cliente.arquivos ?? []).length === 0 ? (
              <li className="text-sm text-muted-foreground">Nenhum arquivo enviado.</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
