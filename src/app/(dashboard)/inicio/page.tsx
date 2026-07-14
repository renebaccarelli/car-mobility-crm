import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ETAPA_PROCESSO_LABELS } from "@/lib/labels";
import { NovoLeadDialog } from "../leads/novo-lead-form";
import type { SessionPayload } from "@/lib/session";

function diasAtras(data: string) {
  const dias = Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24));
  if (dias <= 0) return "hoje";
  return `${dias} dia${dias === 1 ? "" : "s"} atrás`;
}

export default async function InicioPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.perfil === "VENDEDOR") {
    return <VendedorDashboard session={session} />;
  }

  return <AdminDashboard session={session} />;
}

async function VendedorDashboard({ session }: { session: SessionPayload }) {
  const supabase = await createClient();

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome, etapaAtual, createdAt, pedidos(id)")
    .order("createdAt", { ascending: false });

  type ClienteRow = {
    id: string;
    nome: string;
    etapaAtual: keyof typeof ETAPA_PROCESSO_LABELS;
    createdAt: string;
    pedidos: { id: string }[];
  };

  const lista = (clientes ?? []) as unknown as ClienteRow[];
  const leads = lista.filter((c) => c.pedidos.length === 0);
  const clientesAtivos = lista.filter((c) => c.pedidos.length > 0);
  const recentes = lista.slice(0, 6);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-normal text-muted-foreground">
            Seja bem-vindo, {session.nome}
          </CardTitle>
          <NovoLeadDialog />
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/leads">
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Leads em aberto</p>
              <p className="mt-1 text-3xl font-semibold">{leads.length}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/clientes">
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Clientes ativos</p>
              <p className="mt-1 text-3xl font-semibold">{clientesAtivos.length}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cadastros recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentes.map((cliente) => (
            <Link
              key={cliente.id}
              href={`/clientes/${cliente.id}`}
              className="flex items-center justify-between rounded-md border p-3 text-sm transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">{cliente.nome}</p>
                <p className="text-xs text-muted-foreground">{diasAtras(cliente.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{ETAPA_PROCESSO_LABELS[cliente.etapaAtual]}</Badge>
                <Badge variant={cliente.pedidos.length > 0 ? "default" : "secondary"}>
                  {cliente.pedidos.length > 0 ? "Cliente" : "Lead"}
                </Badge>
              </div>
            </Link>
          ))}
          {recentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cadastro ainda.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

async function AdminDashboard({ session }: { session: SessionPayload }) {
  const supabase = await createClient();

  const [{ data: servicos }, { data: pedidoItens }] = await Promise.all([
    supabase.from("servicos").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("pedido_itens").select("servicoId, statusServico"),
  ]);

  const contagemPorServico = new Map<string, number>();
  for (const item of pedidoItens ?? []) {
    if (item.statusServico === "CONCLUIDO") continue;
    contagemPorServico.set(item.servicoId, (contagemPorServico.get(item.servicoId) ?? 0) + 1);
  }
  const totalEmAndamento = [...contagemPorServico.values()].reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal text-muted-foreground">
            Seja bem-vindo, {session.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(servicos ?? []).map((servico) => {
              const count = contagemPorServico.get(servico.id) ?? 0;
              const percentual = totalEmAndamento > 0 ? (count / totalEmAndamento) * 100 : 0;
              return (
                <div key={servico.id} className="rounded-lg bg-primary/95 p-4 text-primary-foreground">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                    {servico.nome}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {count} <span className="text-xs font-normal opacity-80">serviços</span>
                  </p>
                  <p className="text-xs opacity-70">{percentual.toFixed(2)} %</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
