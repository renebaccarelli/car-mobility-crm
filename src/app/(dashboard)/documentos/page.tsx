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
import { NovoDocumentoTemplateDialog } from "./template-form";
import { DeleteTemplateButton } from "./delete-button";

export default async function DocumentosPage() {
  const session = await getSession();
  const isAdmin = session?.perfil === "ADMINISTRADOR";

  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("documento_templates")
    .select("*")
    .order("createdAt", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Documentos</h1>
        {isAdmin ? <NovoDocumentoTemplateDialog /> : null}
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo do documento</TableHead>
              {isAdmin ? <TableHead className="text-right">Ações</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(templates ?? []).map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.nome}</TableCell>
                <TableCell>
                  <Badge>Ativo</Badge>
                </TableCell>
                <TableCell>Conteúdo</TableCell>
                {isAdmin ? (
                  <TableCell className="text-right">
                    <DeleteTemplateButton id={template.id} />
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
            {(templates ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum documento cadastrado.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
