import { createClient } from "@/lib/supabase/server";
import { ClientesTable, PeriodoFilter } from "@/components/clientes/clientes-table";
import { periodoParaData } from "@/lib/periodo";
import { NovoLeadDialog } from "./novo-lead-form";
import type { ClienteRow } from "@/components/clientes/clientes-table";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo = "" } = await searchParams;
  const desde = periodoParaData(periodo);

  const supabase = await createClient();

  let query = supabase
    .from("clientes")
    .select("id, nome, etapaAtual, createdAt, usuarios(nome), pedidos(id)")
    .order("createdAt", { ascending: false });

  if (desde) {
    query = query.gte("createdAt", desde.inicio.toISOString()).lte("createdAt", desde.fim.toISOString());
  }

  const { data } = await query;
  const clientes = ((data as unknown as ClienteRow[]) ?? []).filter((c) => c.pedidos.length === 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Leads</h1>
        <div className="flex items-center gap-2">
          <PeriodoFilter basePath="/leads" ativo={periodo} />
          <NovoLeadDialog />
        </div>
      </div>
      <div className="rounded-lg border bg-background">
        <ClientesTable clientes={clientes} detailBasePath="/clientes" />
      </div>
    </div>
  );
}
