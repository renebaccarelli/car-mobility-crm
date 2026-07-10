import Link from "next/link";
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
import { NovoGrupoDialog } from "./grupo-form";

export default async function CadastrosPage() {
  const grupos = await prisma.grupo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { empresas: true } },
      empresas: {
        select: {
          _count: { select: { usuarios: true, clientes: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Grupos</h1>
        <NovoGrupoDialog />
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresas</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead>Clientes atrelados</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grupos.map((grupo) => {
              const usuarios = grupo.empresas.reduce((sum, e) => sum + e._count.usuarios, 0);
              const clientes = grupo.empresas.reduce((sum, e) => sum + e._count.clientes, 0);
              return (
                <TableRow key={grupo.id}>
                  <TableCell>
                    <Link href={`/cadastros/${grupo.id}`} className="font-medium hover:underline">
                      {grupo.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{grupo._count.empresas}</TableCell>
                  <TableCell>{usuarios}</TableCell>
                  <TableCell>{clientes}</TableCell>
                  <TableCell>
                    <Badge variant={grupo.ativo ? "default" : "secondary"}>
                      {grupo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {grupos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum grupo cadastrado.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
