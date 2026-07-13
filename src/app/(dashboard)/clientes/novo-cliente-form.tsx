"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { CpfInput } from "@/components/ui/cpf-input";
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
import { createClienteAction } from "./actions";

const initialState: { error?: string } = {};

export function NovoClienteDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createClienteAction, initialState);

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Novo cliente</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastro do cliente</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="nome">Nome do cliente*</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento</Label>
              <Input id="dataNascimento" name="dataNascimento" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <CpfInput id="cpf" name="cpf" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input id="rg" name="rg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Whatsapp</Label>
              <PhoneInput id="whatsapp" name="whatsapp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone principal*</Label>
              <PhoneInput id="telefone" name="telefone" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condutor">Condutor?</Label>
            <Select name="condutor" defaultValue="nao">
              <SelectTrigger id="condutor" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferenciaContato">Preferência de contato</Label>
            <Select name="preferenciaContato" defaultValue="TELEFONE">
              <SelectTrigger id="preferenciaContato" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TELEFONE">Telefone</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                <SelectItem value="EMAIL">E-mail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="indicadoPor">Indicado por</Label>
            <Input id="indicadoPor" name="indicadoPor" />
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
