"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import { CATEGORIA_SERVICO_LABELS } from "@/lib/labels";
import { createServicoAction } from "./actions";

const initialState: { error?: string } = {};

export function NovoServicoDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createServicoAction, initialState);

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Serviço</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo serviço</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do serviço</Label>
            <Input id="nome" name="nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select name="categoria" defaultValue="RECOMENDADOS">
              <SelectTrigger id="categoria" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    CATEGORIA_SERVICO_LABELS[value as keyof typeof CATEGORIA_SERVICO_LABELS]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIA_SERVICO_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valorPadrao">Valor do serviço</Label>
            <CurrencyInput id="valorPadrao" name="valorPadrao" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" name="descricao" rows={3} />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Cadastrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
