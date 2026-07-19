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
import { updateConcessionariaAction } from "./actions";

const initialState: { error?: string } = {};

type Marca = { id: string; nome: string };
type ConcessionariaEditavel = { id: string; nome: string; telefone: string | null };

export function EditarConcessionariaDialog({
  concessionaria,
  marcas,
  marcaIdsAtuais,
}: {
  concessionaria: ConcessionariaEditavel;
  marcas: Marca[];
  marcaIdsAtuais: string[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateConcessionariaAction, initialState);
  const [buscaMarca, setBuscaMarca] = useState("");

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  const termoBusca = buscaMarca.trim().toLowerCase();
  const nenhumaMarcaVisivel =
    termoBusca.length > 0 && !marcas.some((marca) => marca.nome.toLowerCase().includes(termoBusca));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Editar</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar concessionária</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="concessionariaId" value={concessionaria.id} />
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" defaultValue={concessionaria.nome} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <PhoneInput
              id="telefone"
              name="telefone"
              defaultValue={concessionaria.telefone ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Marcas</Label>
            {marcas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma marca cadastrada.</p>
            ) : (
              <div className="space-y-2 rounded-md border p-3">
                <Input
                  placeholder="Buscar marca..."
                  value={buscaMarca}
                  onChange={(e) => setBuscaMarca(e.target.value)}
                  className="h-7"
                />
                <div className="grid max-h-48 grid-cols-2 gap-x-3 gap-y-2 overflow-y-auto">
                  {marcas.map((marca) => (
                    <div
                      key={marca.id}
                      className={
                        termoBusca && !marca.nome.toLowerCase().includes(termoBusca)
                          ? "hidden"
                          : "flex items-center gap-2"
                      }
                    >
                      <Checkbox
                        id={`edit-marca-${marca.id}`}
                        name="marcaIds"
                        value={marca.id}
                        defaultChecked={marcaIdsAtuais.includes(marca.id)}
                      />
                      <Label htmlFor={`edit-marca-${marca.id}`} className="font-normal">
                        {marca.nome}
                      </Label>
                    </div>
                  ))}
                  {nenhumaMarcaVisivel ? (
                    <p className="col-span-2 text-sm text-muted-foreground">Nenhuma marca encontrada.</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending || marcas.length === 0}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
