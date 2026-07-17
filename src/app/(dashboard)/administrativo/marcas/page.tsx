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
import { NovaMarcaDialog } from "./marca-form";
import { MarcaAtivoToggle } from "./toggle";

export default async function MarcasPage() {
  const session = await getSession();
  if (session?.perfil !== "ADMINISTRADOR") redirect("/inicio");

  const supabase = await createClient();
  const { data: marcas } = await supabase.from("marcas").select("*").order("nome");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Marcas</h1>
        <NovaMarcaDialog />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marca</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(marcas ?? []).map((marca) => (
              <TableRow key={marca.id}>
                <TableCell className="font-medium">{marca.nome}</TableCell>
                <TableCell>
                  <Badge variant={marca.ativo ? "default" : "secondary"}>
                    {marca.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <MarcaAtivoToggle marcaId={marca.id} ativo={marca.ativo} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
