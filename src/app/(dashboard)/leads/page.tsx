import { prisma } from "@/lib/db";
import { ClientesTable, PeriodoFilter } from "@/components/clientes/clientes-table";
import { periodoParaData } from "@/lib/periodo";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo = "" } = await searchParams;
  const desde = periodoParaData(periodo);

  const clientes = await prisma.cliente.findMany({
    where: {
      pedidos: { none: {} },
      ...(desde ? { createdAt: { gte: desde.inicio, lte: desde.fim } } : {}),
    },
    include: {
      empresa: { select: { nome: true } },
      consultor: { select: { nome: true } },
      _count: { select: { pedidos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Leads</h1>
        <PeriodoFilter basePath="/leads" ativo={periodo} />
      </div>
      <div className="rounded-lg border bg-background">
        <ClientesTable clientes={clientes} detailBasePath="/clientes" />
      </div>
    </div>
  );
}
