"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
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
import { createVendedorAction } from "./actions";

const initialState: { error?: string } = {};

export type Unidade = {
  id: string;
  concessionariaId: string;
  concessionariaNome: string;
  marcaNome: string;
};

export function NovoVendedorDialog({ unidades }: { unidades: Unidade[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createVendedorAction, initialState);
  const [perfil, setPerfil] = useState<"ADMINISTRADOR" | "VENDEDOR">("VENDEDOR");
  const [concessionariaId, setConcessionariaId] = useState("");
  const [concessionariaMarcaId, setConcessionariaMarcaId] = useState("");

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  const concessionarias = useMemo(() => {
    const vistas = new Map<string, string>();
    for (const unidade of unidades) {
      if (!vistas.has(unidade.concessionariaId)) {
        vistas.set(unidade.concessionariaId, unidade.concessionariaNome);
      }
    }
    return Array.from(vistas.entries()).map(([id, nome]) => ({ id, nome }));
  }, [unidades]);

  const marcasDaConcessionaria = useMemo(
    () => unidades.filter((u) => u.concessionariaId === concessionariaId),
    [unidades, concessionariaId]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setPerfil("VENDEDOR");
          setConcessionariaId("");
          setConcessionariaMarcaId("");
        }
      }}
    >
      <DialogTrigger render={<Button>+ Vendedor</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo vendedor</DialogTitle>
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
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" name="senha" type="password" minLength={6} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil</Label>
            <Select
              name="perfil"
              value={perfil}
              onValueChange={(v) => setPerfil((v ?? "VENDEDOR") as "ADMINISTRADOR" | "VENDEDOR")}
            >
              <SelectTrigger id="perfil" className="w-full">
                <SelectValue>
                  {(value: string) => (value === "ADMINISTRADOR" ? "Administrador" : "Vendedor")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {perfil === "VENDEDOR" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="concessionaria">Concessionária</Label>
                <Select
                  value={concessionariaId}
                  onValueChange={(v) => {
                    setConcessionariaId(v ?? "");
                    setConcessionariaMarcaId("");
                  }}
                >
                  <SelectTrigger id="concessionaria" className="w-full">
                    <SelectValue placeholder="Selecione a concessionária">
                      {(value: string) =>
                        concessionarias.find((c) => c.id === value)?.nome ?? "Selecione a concessionária"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {concessionarias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Select
                  value={concessionariaMarcaId}
                  onValueChange={(v) => setConcessionariaMarcaId(v ?? "")}
                  disabled={!concessionariaId}
                >
                  <SelectTrigger id="marca" className="w-full">
                    <SelectValue placeholder="Selecione a marca">
                      {(value: string) =>
                        marcasDaConcessionaria.find((u) => u.id === value)?.marcaNome ?? "Selecione a marca"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {marcasDaConcessionaria.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.marcaNome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="concessionariaMarcaId" value={concessionariaMarcaId} />
              </div>
            </>
          ) : null}
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Cadastrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
