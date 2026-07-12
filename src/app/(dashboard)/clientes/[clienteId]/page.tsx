import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
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
import { PREFERENCIA_CONTATO_LABELS } from "@/lib/labels";
import { PipelineStepper } from "./pipeline-stepper";
import { EditarClienteDialog } from "./editar-cliente-form";
import { NovoCondutorDialog } from "./condutor-form";
import { NovaMensagemForm } from "./nova-mensagem";
import { NovaVendaDialog } from "./nova-venda-dialog";
import { PedidoItemPagoToggle } from "./pedido-item-pago-toggle";
import { UploadArquivoForm } from "./upload-arquivo-form";
import { ArquivoDeleteButton } from "./arquivo-delete-button";
import { RequerimentosMenu } from "./requerimentos-menu";
import { TarefasCard } from "./tarefas-card";

function formatarData(data: string | null) {
  if (!data) return "Não informado";
  return new Date(data).toLocaleDateString("pt-BR");
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const session = await getSession();
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select(
      `*,
      usuarios(nome),
      condutoresAutorizados:condutores_autorizados(*),
      mensagens(*, usuarios(nome)),
      pedidos(*, pedido_itens(*, servicos(nome))),
      arquivos:arquivos_cliente(*),
      tarefas(*)`
    )
    .eq("id", clienteId)
    .maybeSingle();

  if (!cliente) notFound();

  const [{ data: servicos }, { data: documentoTemplates }] = await Promise.all([
    supabase.from("servicos").select("*").eq("ativo", true).order("nome"),
    supabase.from("documento_templates").select("id, nome").order("nome"),
  ]);

  const isAdmin = session?.perfil === "ADMINISTRADOR";

  const mensagens = [...(cliente.mensagens ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const arquivos = [...(cliente.arquivos ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const tarefas = [...(cliente.tarefas ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  type PedidoItemRow = {
    id: string;
    valor: number;
    pago: boolean;
    servicos: { nome: string };
  };

  const servicosContratados: (PedidoItemRow & { pedidoNumero: string })[] = (
    cliente.pedidos ?? []
  ).flatMap((pedido: { numero: string; pedido_itens: PedidoItemRow[] }) =>
    pedido.pedido_itens.map((item) => ({ ...item, pedidoNumero: pedido.numero }))
  );

  return (
    <div className="space-y-4">
      <PipelineStepper clienteId={cliente.id} etapaAtual={cliente.etapaAtual} podeEditar={isAdmin} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{cliente.nome}</CardTitle>
              <div className="mt-1 flex gap-1.5">
                {cliente.condutor ? <Badge variant="outline">Condutor</Badge> : null}
                <Badge variant={cliente.ativo ? "default" : "secondary"}>
                  {cliente.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <RequerimentosMenu clienteId={cliente.id} templates={documentoTemplates ?? []} />
              {isAdmin ? <EditarClienteDialog cliente={cliente} /> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <Field label="CPF" value={cliente.cpf ?? "Não informado"} />
            <Field label="RG" value={cliente.rg ?? "Não informado"} />
            <Field label="CNH" value={cliente.cnh ?? "Não informado"} />
            <Field
              label="Deficiência é nos membros inferiores?"
              value={
                cliente.deficienciaMembrosInferiores === null
                  ? "Não informado"
                  : cliente.deficienciaMembrosInferiores
                    ? "Sim"
                    : "Não"
              }
            />
            <Field label="Telefone" value={cliente.telefone ?? "Não informado"} />
            <Field label="Whatsapp" value={cliente.whatsapp ?? "Não informado"} />
            <Field label="E-mail" value={cliente.email ?? "Não informado"} />
            <Field label="Data de nascimento" value={formatarData(cliente.dataNascimento)} />
            <Field
              label="Preferência de contato"
              value={
                cliente.preferenciaContato
                  ? PREFERENCIA_CONTATO_LABELS[
                      cliente.preferenciaContato as keyof typeof PREFERENCIA_CONTATO_LABELS
                    ]
                  : "Não informado"
              }
            />

            <div className="border-t pt-2.5">
              <p className="text-muted-foreground">
                Condutores autorizados{" "}
                {cliente.condutoresAutorizados.length === 0 ? (
                  <NovoCondutorDialog clienteId={cliente.id} />
                ) : null}
              </p>
              {cliente.condutoresAutorizados.map((condutor: { id: string; nome: string }) => (
                <p key={condutor.id}>{condutor.nome}</p>
              ))}
            </div>

            <div className="border-t pt-2.5 text-xs text-muted-foreground">
              <p>
                Vendedor responsável:{" "}
                <span className="font-medium text-foreground">
                  {cliente.usuarios?.nome ?? "Não definido"}
                </span>
              </p>
            </div>

            <div className="space-y-2 border-t pt-2.5">
              <p className="text-muted-foreground">Documentos</p>
              <UploadArquivoForm clienteId={cliente.id} />
              <ul className="space-y-1">
                {arquivos.map((arquivo) => (
                  <li key={arquivo.id} className="flex items-center justify-between gap-2 text-xs">
                    <a
                      href={`/api/arquivos/${arquivo.id}`}
                      className="truncate text-primary hover:underline"
                      target="_blank"
                    >
                      {arquivo.nome}
                    </a>
                    <ArquivoDeleteButton arquivoId={arquivo.id} clienteId={cliente.id} />
                  </li>
                ))}
                {arquivos.length === 0 ? (
                  <li className="text-xs text-muted-foreground">Nenhum arquivo enviado.</li>
                ) : null}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Serviços</CardTitle>
              <NovaVendaDialog
                clienteId={cliente.id}
                servicos={(servicos ?? []).map((s) => ({
                  id: s.id,
                  valorPadrao: Number(s.valorPadrao),
                  nome: s.nome,
                  categoria: s.categoria,
                }))}
              />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço contratado</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicosContratados.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.servicos.nome}</TableCell>
                      <TableCell>{formatarMoeda(Number(item.valor))}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.pago ? "Em andamento" : "Aguardando confirmação"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <PedidoItemPagoToggle
                          pedidoItemId={item.id}
                          clienteId={cliente.id}
                          pago={item.pago}
                          podeEditar={isAdmin}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {servicosContratados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum serviço contratado ainda.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <TarefasCard clienteId={cliente.id} tarefas={tarefas} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acompanhamento do cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NovaMensagemForm clienteId={cliente.id} />
              <div className="space-y-3">
                {mensagens.map((mensagem) => (
                  <div key={mensagem.id} className="rounded-md border p-3 text-sm">
                    <p className="text-xs text-muted-foreground">
                      {mensagem.usuarios?.nome ?? "Sistema"} ·{" "}
                      {new Date(mensagem.createdAt).toLocaleString("pt-BR")}
                    </p>
                    <p className="mt-1">{mensagem.texto}</p>
                  </div>
                ))}
                {mensagens.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma mensagem registrada.</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
