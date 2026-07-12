import { redirect } from "next/navigation";
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
import { ETAPA_PROCESSO_LABELS, PERFIL_LABELS } from "@/lib/labels";
import { NovoVendedorDialog } from "./vendedor-form";
import { VendedorAtivoToggle } from "./toggle";

export default async function VendedoresPage() {
  const session = await getSession();
  if (session?.perfil !== "ADMINISTRADOR") redirect("/inicio");

  const supabase = await createClient();

  const [{ data: usuarios }, { data: clientes }] = await Promise.all([
    supabase.from("usuarios").select("*").order("nome"),
    supabase.from("clientes").select("cadastradoPorId, etapaAtual"),
  ]);

  const clientesPorVendedor = new Map<string, number>();
  const clientesPorEtapa = new Map<string, number>();
  for (const cliente of clientes ?? []) {
    clientesPorVendedor.set(
      cliente.cadastradoPorId,
      (clientesPorVendedor.get(cliente.cadastradoPorId) ?? 0) + 1
    );
    clientesPorEtapa.set(cliente.etapaAtual, (clientesPorEtapa.get(cliente.etapaAtual) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Métricas — oportunidades por etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Object.entries(ETAPA_PROCESSO_LABELS).map(([etapa, label]) => (
              <div key={etapa} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold">{clientesPorEtapa.get(etapa) ?? 0}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Vendedores</h1>
        <NovoVendedorDialog />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Oportunidades cadastradas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(usuarios ?? []).map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>
                  <div className="font-medium">{usuario.nome}</div>
                  <div className="text-xs text-muted-foreground">{usuario.email}</div>
                </TableCell>
                <TableCell>{PERFIL_LABELS[usuario.perfil as keyof typeof PERFIL_LABELS]}</TableCell>
                <TableCell>{clientesPorVendedor.get(usuario.id) ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={usuario.ativo ? "default" : "secondary"}>
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <VendedorAtivoToggle usuarioId={usuario.id} ativo={usuario.ativo} />
                </TableCell>
              </TableRow>
            ))}
            {(usuarios ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum vendedor cadastrado.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
