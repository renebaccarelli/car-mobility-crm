import { createClient } from "@/lib/supabase/server";
import { ClientesTable, PeriodoFilter } from "@/components/clientes/clientes-table";
import { periodoParaData } from "@/lib/periodo";
import { NovoLeadDialog } from "./novo-lead-form";
import { VendedorFilter, type VendedorOption } from "./vendedor-filter";
import type { ClienteRow } from "@/components/clientes/clientes-table";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; vendedorId?: string }>;
}) {
  const { periodo = "", vendedorId = "" } = await searchParams;
  const desde = periodoParaData(periodo);

  const supabase = await createClient();

  let query = supabase
    .from("clientes")
    .select(
      "id, nome, etapaAtual, createdAt, usuarios(nome, concessionariaMarca:concessionaria_marcas(concessionaria:concessionarias(nome), marca:marcas(nome))), pedidos(id)"
    )
    .order("createdAt", { ascending: false });

  if (desde) {
    query = query.gte("createdAt", desde.inicio.toISOString()).lte("createdAt", desde.fim.toISOString());
  }

  if (vendedorId) {
    query = query.eq("cadastradoPorId", vendedorId);
  }

  const [{ data }, { data: vendedoresRaw }] = await Promise.all([
    query,
    supabase
      .from("usuarios")
      .select(
        "id, nome, concessionariaMarca:concessionaria_marcas(concessionaria:concessionarias(nome), marca:marcas(nome))"
      )
      .eq("perfil", "VENDEDOR")
      .eq("ativo", true)
      .order("nome"),
  ]);

  const clientes = ((data as unknown as ClienteRow[]) ?? []).filter((c) => c.pedidos.length === 0);

  const vendedores: VendedorOption[] = (vendedoresRaw ?? []).map((v) => {
    const unidade = v.concessionariaMarca as unknown as {
      concessionaria: { nome: string } | null;
      marca: { nome: string } | null;
    } | null;
    return {
      id: v.id,
      nome: v.nome,
      concessionariaNome: unidade?.concessionaria?.nome ?? null,
      marcaNome: unidade?.marca?.nome ?? null,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Leads</h1>
        <div className="flex items-center gap-2">
          <VendedorFilter vendedores={vendedores} basePath="/leads" />
          <PeriodoFilter
            basePath="/leads"
            ativo={periodo}
            extraQuery={vendedorId ? { vendedorId } : undefined}
          />
          <NovoLeadDialog />
        </div>
      </div>
      <div className="rounded-lg border bg-background">
        <ClientesTable clientes={clientes} detailBasePath="/clientes" />
      </div>
    </div>
  );
}
