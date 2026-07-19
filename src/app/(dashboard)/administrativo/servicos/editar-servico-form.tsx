"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { updateServicoAction } from "./actions";

const initialState: { error?: string } = {};

type ServicoEditavel = {
  id: string;
  nome: string;
  categoria: string;
  valorPadrao: string | number;
  descricao: string | null;
};

export function EditarServicoDialog({ servico }: { servico: ServicoEditavel }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateServicoAction, initialState);

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Editar</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar serviço</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="servicoId" value={servico.id} />
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do serviço</Label>
            <Input id="nome" name="nome" defaultValue={servico.nome} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select name="categoria" defaultValue={servico.categoria}>
              <SelectTrigger id="categoria" className="w-full">
                <SelectValue />
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
            <Input
              id="valorPadrao"
              name="valorPadrao"
              type="number"
              step="0.01"
              min="0"
              defaultValue={String(servico.valorPadrao)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" name="descricao" rows={3} defaultValue={servico.descricao ?? ""} />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
