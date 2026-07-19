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
import { NovaConcessionariaDialog } from "./concessionaria-form";
import { EditarConcessionariaDialog } from "./editar-concessionaria-form";
import { ConcessionariaAtivoToggle } from "./toggle";
import { deleteConcessionariaAction } from "./actions";

export default async function ConcessionariasPage() {
  const session = await getSession();
  if (session?.perfil !== "ADMINISTRADOR") redirect("/inicio");

  const supabase = await createClient();

  const [{ data: concessionarias }, { data: unidades }, { data: marcas }, { data: vendedores }] =
    await Promise.all([
      supabase.from("concessionarias").select("*").order("nome"),
      supabase.from("concessionaria_marcas").select("id, concessionariaId, marcaId, marca:marcas(nome)"),
      supabase.from("marcas").select("id, nome").eq("ativo", true).order("nome"),
      supabase.from("usuarios").select("concessionariaMarcaId").eq("perfil", "VENDEDOR"),
    ]);

  const marcasPorConcessionaria = new Map<string, string[]>();
  const marcaIdsPorConcessionaria = new Map<string, string[]>();
  const concessionariaPorUnidade = new Map<string, string>();
  for (const unidade of unidades ?? []) {
    concessionariaPorUnidade.set(unidade.id, unidade.concessionariaId);
    const nomeMarca = (unidade.marca as unknown as { nome: string } | null)?.nome;
    if (nomeMarca) {
      const lista = marcasPorConcessionaria.get(unidade.concessionariaId) ?? [];
      lista.push(nomeMarca);
      marcasPorConcessionaria.set(unidade.concessionariaId, lista);
    }
    const idsLista = marcaIdsPorConcessionaria.get(unidade.concessionariaId) ?? [];
    idsLista.push(unidade.marcaId);
    marcaIdsPorConcessionaria.set(unidade.concessionariaId, idsLista);
  }

  const vendedoresPorConcessionaria = new Map<string, number>();
  for (const vendedor of vendedores ?? []) {
    if (!vendedor.concessionariaMarcaId) continue;
    const concessionariaId = concessionariaPorUnidade.get(vendedor.concessionariaMarcaId);
    if (!concessionariaId) continue;
    vendedoresPorConcessionaria.set(
      concessionariaId,
      (vendedoresPorConcessionaria.get(concessionariaId) ?? 0) + 1
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Concessionárias</h1>
        <NovaConcessionariaDialog marcas={marcas ?? []} />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concessionária</TableHead>
              <TableHead>Marcas</TableHead>
              <TableHead>Vendedores</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
              <TableHead className="text-right">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(concessionarias ?? []).map((concessionaria) => (
              <TableRow key={concessionaria.id}>
                <TableCell>
                  <div className="font-medium">{concessionaria.nome}</div>
                  {concessionaria.telefone ? (
                    <div className="text-xs text-muted-foreground">{concessionaria.telefone}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  {(marcasPorConcessionaria.get(concessionaria.id) ?? []).join(", ") || "—"}
                </TableCell>
                <TableCell>{vendedoresPorConcessionaria.get(concessionaria.id) ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={concessionaria.ativo ? "default" : "secondary"}>
                    {concessionaria.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <EditarConcessionariaDialog
                      concessionaria={concessionaria}
                      marcas={marcas ?? []}
                      marcaIdsAtuais={marcaIdsPorConcessionaria.get(concessionaria.id) ?? []}
                    />
                    <DeleteButton
                      action={deleteConcessionariaAction.bind(null, concessionaria.id)}
                      confirmMessage={`Remover a concessionária "${concessionaria.nome}"? O login de acesso dela também será removido. Essa ação não pode ser desfeita.`}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <ConcessionariaAtivoToggle
                    concessionariaId={concessionaria.id}
                    ativo={concessionaria.ativo}
                  />
                </TableCell>
              </TableRow>
            ))}
            {(concessionarias ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhuma concessionária cadastrada.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
