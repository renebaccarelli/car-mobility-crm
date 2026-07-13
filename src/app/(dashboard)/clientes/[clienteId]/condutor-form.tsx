"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CpfInput } from "@/components/ui/cpf-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import { addCondutorAction } from "../actions";

const initialState: { error?: string } = {};

export function NovoCondutorDialog({ clienteId }: { clienteId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addCondutorAction, initialState);

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button type="button" className="text-sm text-primary hover:underline">Adicionar.</button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo condutor autorizado</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="clienteId" value={clienteId} />
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <CpfInput id="cpf" name="cpf" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnh">CNH</Label>
            <Input id="cnh" name="cnh" />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
