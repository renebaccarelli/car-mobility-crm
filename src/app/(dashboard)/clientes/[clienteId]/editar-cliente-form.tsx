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
import { updateClienteAction } from "../actions";

const initialState: { error?: string } = {};

type ClienteEditavel = {
  id: string;
  nome: string;
  cpf: string | null;
  cnh: string | null;
  dataNascimento: string | null;
  telefone: string | null;
  whatsapp: string | null;
  preferenciaContato: string | null;
  condutor: boolean;
  deficienciaMembrosInferiores: boolean | null;
};

export function EditarClienteDialog({ cliente }: { cliente: ClienteEditavel }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateClienteAction, initialState);
  const [nome, setNome] = useState(cliente.nome);
  const [cnh, setCnh] = useState(cliente.cnh ?? "");
  const [dataNascimento, setDataNascimento] = useState(
    cliente.dataNascimento ? cliente.dataNascimento.slice(0, 10) : ""
  );
  const [condutor, setCondutor] = useState(cliente.condutor ? "sim" : "nao");
  const [deficienciaMembrosInferiores, setDeficienciaMembrosInferiores] = useState(
    cliente.deficienciaMembrosInferiores === null
      ? ""
      : cliente.deficienciaMembrosInferiores
        ? "sim"
        : "nao"
  );
  const [preferenciaContato, setPreferenciaContato] = useState(
    cliente.preferenciaContato ?? "TELEFONE"
  );

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Editar</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="clienteId" value={cliente.id} />
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <CpfInput id="cpf" name="cpf" defaultValue={cliente.cpf ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnh">CNH</Label>
              <Input id="cnh" name="cnh" value={cnh} onChange={(e) => setCnh(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento</Label>
              <Input
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <PhoneInput id="telefone" name="telefone" defaultValue={cliente.telefone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Whatsapp</Label>
              <PhoneInput id="whatsapp" name="whatsapp" defaultValue={cliente.whatsapp ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="condutor">Condutor?</Label>
              <Select name="condutor" value={condutor} onValueChange={(v) => setCondutor(v ?? "nao")}>
                <SelectTrigger id="condutor" className="w-full">
                  <SelectValue>{(value: string) => (value === "sim" ? "Sim" : "Não")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deficienciaMembrosInferiores">Deficiência nos membros inferiores?</Label>
              <Select
                name="deficienciaMembrosInferiores"
                value={deficienciaMembrosInferiores}
                onValueChange={(v) => setDeficienciaMembrosInferiores(v ?? "")}
              >
                <SelectTrigger id="deficienciaMembrosInferiores" className="w-full">
                  <SelectValue placeholder="Não informado">
                    {(value: string) => (value === "sim" ? "Sim" : value === "nao" ? "Não" : "Não informado")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Não informado</SelectItem>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferenciaContato">Preferência de contato</Label>
            <Select
              name="preferenciaContato"
              value={preferenciaContato}
              onValueChange={(v) => setPreferenciaContato(v ?? "TELEFONE")}
            >
              <SelectTrigger id="preferenciaContato" className="w-full">
                <SelectValue>
                  {(value: string) => (value === "WHATSAPP" ? "WhatsApp" : "Telefone")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TELEFONE">Telefone</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
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
