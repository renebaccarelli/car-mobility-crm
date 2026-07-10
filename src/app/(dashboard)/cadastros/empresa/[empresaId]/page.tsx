import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { METODO_PAGAMENTO_LABELS, PERFIL_LABELS } from "@/lib/labels";
import { NovoUsuarioDialog } from "../../usuario-form";
import { MetodoPagamentoToggle, UsuarioAtivoToggle } from "../toggles";
import { EmpresaServicoRow } from "../empresa-servico-row";

export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ empresaId: string }>;
}) {
  const { empresaId } = await params;

  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    include: {
      grupo: true,
      usuarios: { orderBy: { createdAt: "desc" } },
      metodosPagamento: { orderBy: { metodo: "asc" } },
      servicos: { include: { servico: true }, orderBy: { servico: { nome: "asc" } } },
    },
  });

  if (!empresa) notFound();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {empresa.nome}
            <Badge variant={empresa.ativo ? "default" : "secondary"}>
              {empresa.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">CNPJ</span>
            <span>{empresa.cnpj ?? "Não informado"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marca</span>
            <span>{empresa.marca ?? "Não definida"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Grupo</span>
            <span>{empresa.grupo.nome}</span>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Tabs defaultValue="usuarios">
          <TabsList>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="pagamento">Métodos de pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  {empresa.usuarios.length} usuário(s)
                </CardTitle>
                <NovoUsuarioDialog empresaId={empresa.id} />
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ativo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresa.usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="font-medium">{usuario.nome}</div>
                          <div className="text-xs text-muted-foreground">{usuario.email}</div>
                        </TableCell>
                        <TableCell>{PERFIL_LABELS[usuario.perfil]}</TableCell>
                        <TableCell>
                          <Badge variant={usuario.ativo ? "default" : "secondary"}>
                            {usuario.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <UsuarioAtivoToggle
                            usuarioId={usuario.id}
                            empresaId={empresa.id}
                            ativo={usuario.ativo}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {empresa.usuarios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum usuário cadastrado.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="servicos">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-center">Empresa poderá pagar?</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresa.servicos.map((empresaServico) => (
                      <EmpresaServicoRow
                        key={empresaServico.id}
                        id={empresaServico.id}
                        empresaId={empresa.id}
                        nome={empresaServico.servico.nome}
                        valor={Number(empresaServico.valor)}
                        empresaPodePagar={empresaServico.empresaPodePagar}
                        ativo={empresaServico.ativo}
                      />
                    ))}
                    {empresa.servicos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Nenhum serviço cadastrado no catálogo ainda.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagamento">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Ativo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresa.metodosPagamento.map((metodo) => (
                      <TableRow key={metodo.id}>
                        <TableCell>{METODO_PAGAMENTO_LABELS[metodo.metodo]}</TableCell>
                        <TableCell className="text-right">
                          <MetodoPagamentoToggle
                            id={metodo.id}
                            empresaId={empresa.id}
                            ativo={metodo.ativo}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
