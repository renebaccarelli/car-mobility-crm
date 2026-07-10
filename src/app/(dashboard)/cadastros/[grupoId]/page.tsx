import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
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
import { NovaEmpresaDialog } from "../empresa-form";

export default async function GrupoDetailPage({
  params,
}: {
  params: Promise<{ grupoId: string }>;
}) {
  const { grupoId } = await params;

  const grupo = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: {
      empresas: {
        include: { _count: { select: { usuarios: true, clientes: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!grupo) notFound();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Grupo - {grupo.nome}
            <Badge variant={grupo.ativo ? "default" : "secondary"}>
              {grupo.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Data de cadastro: {grupo.createdAt.toLocaleDateString("pt-BR")}
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Empresas</CardTitle>
          <NovaEmpresaDialog grupoId={grupo.id} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concessionária</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupo.empresas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell>
                    <Link
                      href={`/cadastros/empresa/${empresa.id}`}
                      className="font-medium hover:underline"
                    >
                      {empresa.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{empresa.marca ?? "Nenhuma"}</TableCell>
                  <TableCell>{empresa._count.usuarios}</TableCell>
                  <TableCell>{empresa._count.clientes}</TableCell>
                  <TableCell>
                    <Badge variant={empresa.ativo ? "default" : "secondary"}>
                      {empresa.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {grupo.empresas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma empresa cadastrada.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
