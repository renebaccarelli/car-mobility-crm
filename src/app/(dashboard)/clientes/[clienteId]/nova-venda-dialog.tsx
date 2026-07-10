"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import { CATEGORIA_SERVICO_LABELS } from "@/lib/labels";
import { createVendaAction } from "./venda-actions";
import type { CategoriaServico } from "@prisma/client";

const initialState: { error?: string } = {};

type EmpresaServicoOption = {
  id: string;
  valor: number;
  servico: { nome: string; categoria: CategoriaServico };
};

const CATEGORIAS: CategoriaServico[] = ["RECOMENDADOS", "CNH", "LAUDOS", "ISENCOES"];

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function NovaVendaDialog({
  clienteId,
  empresaServicos,
}: {
  clienteId: string;
  empresaServicos: EmpresaServicoOption[];
}) {
  const [open, setOpen] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [state, formAction, isPending] = useActionState(createVendaAction, initialState);

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSelecionados(new Set());
      }}
    >
      <DialogTrigger render={<Button size="sm">Nova venda</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Selecione os serviços</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="clienteId" value={clienteId} />
          {[...selecionados].map((id) => (
            <input key={id} type="hidden" name="empresaServicoIds" value={id} />
          ))}

          <Tabs defaultValue="RECOMENDADOS">
            <TabsList>
              {CATEGORIAS.map((categoria) => (
                <TabsTrigger key={categoria} value={categoria}>
                  {CATEGORIA_SERVICO_LABELS[categoria]}
                </TabsTrigger>
              ))}
            </TabsList>
            {CATEGORIAS.map((categoria) => (
              <TabsContent key={categoria} value={categoria} className="space-y-2">
                {empresaServicos
                  .filter((es) => es.servico.categoria === categoria)
                  .map((es) => (
                    <div
                      key={es.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{es.servico.nome}</p>
                        <p className="text-xs text-muted-foreground">{formatarMoeda(es.valor)}</p>
                      </div>
                      <Switch
                        checked={selecionados.has(es.id)}
                        onCheckedChange={(checked) => {
                          setSelecionados((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(es.id);
                            else next.delete(es.id);
                            return next;
                          });
                        }}
                      />
                    </div>
                  ))}
                {empresaServicos.filter((es) => es.servico.categoria === categoria).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum serviço nessa categoria.</p>
                ) : null}
              </TabsContent>
            ))}
          </Tabs>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
