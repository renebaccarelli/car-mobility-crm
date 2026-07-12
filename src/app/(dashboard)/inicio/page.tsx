import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NovoLembreteDialog } from "./novo-lembrete-form";
import { LembreteToggle } from "./lembrete-toggle";

function inicioDoDia() {
  const data = new Date();
  data.setHours(0, 0, 0, 0);
  return data;
}

function fimDoDia() {
  const data = new Date();
  data.setHours(23, 59, 59, 999);
  return data;
}

export default async function InicioPage() {
  const session = await getSession();
  if (!session) return null;

  const supabase = await createClient();

  const [{ data: servicos }, { data: pedidoItens }, { data: meusLembretes }, { data: lembretesPublicos }] =
    await Promise.all([
      supabase.from("servicos").select("id, nome").eq("ativo", true).order("nome"),
      supabase.from("pedido_itens").select("servicoId, statusServico"),
      supabase
        .from("lembretes")
        .select("*")
        .eq("usuarioId", session.usuarioId)
        .gte("data", inicioDoDia().toISOString())
        .lte("data", fimDoDia().toISOString())
        .order("data"),
      supabase
        .from("lembretes")
        .select("*")
        .eq("publico", true)
        .gte("data", inicioDoDia().toISOString())
        .lte("data", fimDoDia().toISOString())
        .order("data"),
    ]);

  const contagemPorServico = new Map<string, number>();
  for (const item of pedidoItens ?? []) {
    if (item.statusServico === "CONCLUIDO") continue;
    contagemPorServico.set(item.servicoId, (contagemPorServico.get(item.servicoId) ?? 0) + 1);
  }
  const totalEmAndamento = [...contagemPorServico.values()].reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal text-muted-foreground">
            Seja bem-vindo, {session.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(servicos ?? []).map((servico) => {
              const count = contagemPorServico.get(servico.id) ?? 0;
              const percentual = totalEmAndamento > 0 ? (count / totalEmAndamento) * 100 : 0;
              return (
                <div key={servico.id} className="rounded-lg bg-primary/95 p-4 text-primary-foreground">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                    {servico.nome}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {count} <span className="text-xs font-normal opacity-80">serviços</span>
                  </p>
                  <p className="text-xs opacity-70">{percentual.toFixed(2)} %</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Meus lembretes para hoje</CardTitle>
            <NovoLembreteDialog />
          </CardHeader>
          <CardContent className="space-y-2">
            {(meusLembretes ?? []).map((lembrete) => (
              <div key={lembrete.id} className="flex items-center gap-2 text-sm">
                <LembreteToggle id={lembrete.id} concluido={lembrete.concluido} />
                <span className={lembrete.concluido ? "text-muted-foreground line-through" : ""}>
                  {lembrete.texto}
                </span>
              </div>
            ))}
            {(meusLembretes ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Clique para visualizar o (Últ. 7 dias)
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lembretes públicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(lembretesPublicos ?? []).map((lembrete) => (
              <div key={lembrete.id} className="flex items-center gap-2 text-sm">
                <LembreteToggle id={lembrete.id} concluido={lembrete.concluido} />
                <span className={lembrete.concluido ? "text-muted-foreground line-through" : ""}>
                  {lembrete.texto}
                </span>
              </div>
            ))}
            {(lembretesPublicos ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lembrete público para hoje.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
