import { prisma } from "@/lib/db";
import { ClientesTable, PeriodoFilter } from "@/components/clientes/clientes-table";
import { periodoParaData } from "@/lib/periodo";
import { NovoClienteDialog } from "./novo-cliente-form";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo = "" } = await searchParams;
  const desde = periodoParaData(periodo);

  const [clientes, empresas] = await Promise.all([
    prisma.cliente.findMany({
      where: {
        pedidos: { some: {} },
        ...(desde ? { createdAt: { gte: desde.inicio, lte: desde.fim } } : {}),
      },
      include: {
        empresa: { select: { nome: true } },
        consultor: { select: { nome: true } },
        _count: { select: { pedidos: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.empresa.findMany({ where: { ativo: true }, select: { id: true, nome: true } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Clientes</h1>
        <div className="flex items-center gap-2">
          <PeriodoFilter basePath="/clientes" ativo={periodo} />
          <NovoClienteDialog empresas={empresas} />
        </div>
      </div>
      <div className="rounded-lg border bg-background">
        <ClientesTable clientes={clientes} detailBasePath="/clientes" />
      </div>
    </div>
  );
}
