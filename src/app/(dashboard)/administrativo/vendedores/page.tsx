import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/ui/delete-button";
import { PERFIL_LABELS } from "@/lib/labels";
import { NovoVendedorDialog } from "./vendedor-form";
import { EditarVendedorDialog } from "./editar-vendedor-form";
import { VendedorAtivoToggle } from "./toggle";
import { deleteVendedorAction } from "./actions";

export default async function VendedoresPage() {
  const session = await getSession();
  if (session?.perfil !== "ADMINISTRADOR") redirect("/inicio");

  const supabase = await createClient();

  const [{ data: usuarios }, { data: clientes }, { data: unidadesRaw }] = await Promise.all([
    supabase.from("usuarios").select("*").in("perfil", ["ADMINISTRADOR", "VENDEDOR"]).order("nome"),
    supabase.from("clientes").select("cadastradoPorId"),
    supabase
      .from("concessionaria_marcas")
      .select("id, concessionariaId, concessionaria:concessionarias(nome), marca:marcas(nome)"),
  ]);

  const unidades = (unidadesRaw ?? []).map((u) => ({
    id: u.id,
    concessionariaId: u.concessionariaId,
    concessionariaNome: (u.concessionaria as unknown as { nome: string } | null)?.nome ?? "",
    marcaNome: (u.marca as unknown as { nome: string } | null)?.nome ?? "",
  }));

  const clientesPorVendedor = new Map<string, number>();
  for (const cliente of clientes ?? []) {
    clientesPorVendedor.set(
      cliente.cadastradoPorId,
      (clientesPorVendedor.get(cliente.cadastradoPorId) ?? 0) + 1
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Vendedores</h1>
        <NovoVendedorDialog unidades={unidades} />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Oportunidades cadastradas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    <EditarVendedorDialog vendedor={usuario} unidades={unidades} />
                    {usuario.id !== session.usuarioId ? (
                      <DeleteButton
                        action={deleteVendedorAction.bind(null, usuario.id)}
                        confirmMessage={`Remover o usuário "${usuario.nome}"? Essa ação não pode ser desfeita.`}
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <VendedorAtivoToggle usuarioId={usuario.id} ativo={usuario.ativo} />
                </TableCell>
              </TableRow>
            ))}
            {(usuarios ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
