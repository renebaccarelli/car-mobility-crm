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
import { CATEGORIA_SERVICO_LABELS } from "@/lib/labels";
import { NovoServicoDialog } from "./servico-form";
import { ServicoAtivoToggle } from "./toggle";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ServicosPage() {
  const session = await getSession();
  if (session?.perfil !== "ADMINISTRADOR") redirect("/inicio");

  const supabase = await createClient();
  const { data: servicos } = await supabase.from("servicos").select("*").order("nome");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Serviços</h1>
        <NovoServicoDialog />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(servicos ?? []).map((servico) => (
              <TableRow key={servico.id}>
                <TableCell className="font-medium">{servico.nome}</TableCell>
                <TableCell>
                  {
                    CATEGORIA_SERVICO_LABELS[
                      servico.categoria as keyof typeof CATEGORIA_SERVICO_LABELS
                    ]
                  }
                </TableCell>
                <TableCell>{formatarMoeda(Number(servico.valorPadrao))}</TableCell>
                <TableCell>
                  <Badge variant={servico.ativo ? "default" : "secondary"}>
                    {servico.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <ServicoAtivoToggle servicoId={servico.id} ativo={servico.ativo} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
