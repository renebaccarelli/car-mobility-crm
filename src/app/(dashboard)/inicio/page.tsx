import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

  const [servicos, meusLembretes, lembretesPublicos] = await Promise.all([
    prisma.servico.findMany({
      where: { ativo: true },
      include: {
        _count: {
          select: { pedidoItens: { where: { statusServico: { not: "CONCLUIDO" } } } },
        },
      },
      orderBy: { nome: "asc" },
    }),
    prisma.lembrete.findMany({
      where: { usuarioId: session.usuarioId, data: { gte: inicioDoDia(), lte: fimDoDia() } },
      orderBy: { data: "asc" },
    }),
    prisma.lembrete.findMany({
      where: { publico: true, data: { gte: inicioDoDia(), lte: fimDoDia() } },
      orderBy: { data: "asc" },
    }),
  ]);

  const totalEmAndamento = servicos.reduce((sum, s) => sum + s._count.pedidoItens, 0);

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
            {servicos.map((servico) => {
              const count = servico._count.pedidoItens;
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
            {meusLembretes.map((lembrete) => (
              <div key={lembrete.id} className="flex items-center gap-2 text-sm">
                <LembreteToggle id={lembrete.id} concluido={lembrete.concluido} />
                <span className={lembrete.concluido ? "text-muted-foreground line-through" : ""}>
                  {lembrete.texto}
                </span>
              </div>
            ))}
            {meusLembretes.length === 0 ? (
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
            {lembretesPublicos.map((lembrete) => (
              <div key={lembrete.id} className="flex items-center gap-2 text-sm">
                <LembreteToggle id={lembrete.id} concluido={lembrete.concluido} />
                <span className={lembrete.concluido ? "text-muted-foreground line-through" : ""}>
                  {lembrete.texto}
                </span>
              </div>
            ))}
            {lembretesPublicos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lembrete público para hoje.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
