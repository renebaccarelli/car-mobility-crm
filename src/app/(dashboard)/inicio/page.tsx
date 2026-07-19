import Link from "next/link";
import { getSession } from "@/lib/session";
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
import { ETAPA_PROCESSO_LABELS } from "@/lib/labels";
import { NovoLeadDialog } from "../leads/novo-lead-form";
import { ClientesTable, type ClienteRow } from "@/components/clientes/clientes-table";
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

  if (session.perfil === "CONCESSIONARIA") {
    return <ConcessionariaDashboard session={session} />;
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

async function ConcessionariaDashboard({ session }: { session: SessionPayload }) {
  const supabase = await createClient();

  const [{ data: vendedoresRaw }, { data: clientesRaw }] = await Promise.all([
    supabase
      .from("usuarios")
      .select("id, nome, ativo, concessionariaMarca:concessionaria_marcas(marca:marcas(nome))")
      .eq("perfil", "VENDEDOR")
      .order("nome"),
    supabase
      .from("clientes")
      .select(
        "id, nome, etapaAtual, createdAt, usuarios(nome, concessionariaMarca:concessionaria_marcas(concessionaria:concessionarias(nome), marca:marcas(nome))), pedidos(id)"
      )
      .order("createdAt", { ascending: false }),
  ]);

  type VendedorRow = {
    id: string;
    nome: string;
    ativo: boolean;
    concessionariaMarca: { marca: { nome: string } | null } | null;
  };

  const vendedores = (vendedoresRaw ?? []) as unknown as VendedorRow[];
  const clientes = (clientesRaw ?? []) as unknown as ClienteRow[];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal text-muted-foreground">
            Seja bem-vindo, {session.nome}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendedores.map((vendedor) => (
                <TableRow key={vendedor.id}>
                  <TableCell className="font-medium">{vendedor.nome}</TableCell>
                  <TableCell>{vendedor.concessionariaMarca?.marca?.nome ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={vendedor.ativo ? "default" : "secondary"}>
                      {vendedor.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {vendedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhum vendedor cadastrado.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientesTable clientes={clientes} detailBasePath="/clientes" />
        </CardContent>
      </Card>
    </div>
  );
}

async function AdminDashboard({ session }: { session: SessionPayload }) {
  const supabase = await createClient();

  const [{ data: servicos }, { data: pedidoItens }, { data: clientesRaw }] = await Promise.all([
    supabase.from("servicos").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("pedido_itens").select("servicoId, statusServico"),
    supabase.from("clientes").select("id, pedidos(id)"),
  ]);

  const contagemPorServico = new Map<string, number>();
  for (const item of pedidoItens ?? []) {
    if (item.statusServico === "CONCLUIDO") continue;
    contagemPorServico.set(item.servicoId, (contagemPorServico.get(item.servicoId) ?? 0) + 1);
  }
  const totalEmAndamento = [...contagemPorServico.values()].reduce((sum, n) => sum + n, 0);

  type ClienteResumo = { id: string; pedidos: { id: string }[] };
  const listaClientes = (clientesRaw ?? []) as unknown as ClienteResumo[];
  const totalLeads = listaClientes.filter((c) => c.pedidos.length === 0).length;
  const totalClientesAtivos = listaClientes.filter((c) => c.pedidos.length > 0).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal text-muted-foreground">
            Seja bem-vindo, {session.nome}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/leads">
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Leads em aberto</p>
              <p className="mt-0.5 text-xl font-semibold">{totalLeads}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/clientes">
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Clientes ativos</p>
              <p className="mt-0.5 text-xl font-semibold">{totalClientesAtivos}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Serviços em andamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {(servicos ?? []).map((servico) => {
              const count = contagemPorServico.get(servico.id) ?? 0;
              const percentual = totalEmAndamento > 0 ? (count / totalEmAndamento) * 100 : 0;
              return (
                <div key={servico.id} className="rounded-lg border bg-background p-2.5">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {servico.nome}
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {count} <span className="text-[10px] font-normal text-muted-foreground">serviços</span>
                  </p>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${percentual}%` }} />
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{percentual.toFixed(2)} %</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
