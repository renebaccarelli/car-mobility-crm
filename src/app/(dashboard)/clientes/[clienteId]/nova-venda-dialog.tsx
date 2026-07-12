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

type ServicoOption = {
  id: string;
  valorPadrao: number;
  nome: string;
  categoria: CategoriaServico;
};

const CATEGORIAS: CategoriaServico[] = ["RECOMENDADOS", "CNH", "LAUDOS", "ISENCOES"];

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function NovaVendaDialog({
  clienteId,
  servicos,
}: {
  clienteId: string;
  servicos: ServicoOption[];
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
            <input key={id} type="hidden" name="servicoIds" value={id} />
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
                {servicos
                  .filter((s) => s.categoria === categoria)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatarMoeda(s.valorPadrao)}
                        </p>
                      </div>
                      <Switch
                        checked={selecionados.has(s.id)}
                        onCheckedChange={(checked) => {
                          setSelecionados((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(s.id);
                            else next.delete(s.id);
                            return next;
                          });
                        }}
                      />
                    </div>
                  ))}
                {servicos.filter((s) => s.categoria === categoria).length === 0 ? (
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
