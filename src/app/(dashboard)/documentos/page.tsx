import { prisma } from "@/lib/db";
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
  const templates = await prisma.documentoTemplate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Documentos</h1>
        <NovoDocumentoTemplateDialog />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo do documento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.nome}</TableCell>
                <TableCell>
                  <Badge>Ativo</Badge>
                </TableCell>
                <TableCell>Conteúdo</TableCell>
                <TableCell className="text-right">
                  <DeleteTemplateButton id={template.id} />
                </TableCell>
              </TableRow>
            ))}
            {templates.length === 0 ? (
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
