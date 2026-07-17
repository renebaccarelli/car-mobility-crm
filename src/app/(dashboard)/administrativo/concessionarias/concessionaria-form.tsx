"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import { createConcessionariaAction } from "./actions";

const initialState: { error?: string } = {};

type Marca = { id: string; nome: string };

export function NovaConcessionariaDialog({ marcas }: { marcas: Marca[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createConcessionariaAction, initialState);

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Concessionária</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova concessionária</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <PhoneInput id="telefone" name="telefone" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail de acesso</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" name="senha" type="password" minLength={6} required />
          </div>
          <div className="space-y-2">
            <Label>Marcas</Label>
            <div className="space-y-2 rounded-md border p-3">
              {marcas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Cadastre ao menos uma marca antes de criar uma concessionária.
                </p>
              ) : (
                marcas.map((marca) => (
                  <div key={marca.id} className="flex items-center gap-2">
                    <Checkbox id={`marca-${marca.id}`} name="marcaIds" value={marca.id} />
                    <Label htmlFor={`marca-${marca.id}`} className="font-normal">
                      {marca.nome}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending || marcas.length === 0}>
            {isPending ? "Salvando..." : "Cadastrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
