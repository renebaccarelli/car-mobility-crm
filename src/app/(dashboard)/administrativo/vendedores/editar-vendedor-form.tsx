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
import { updateVendedorAction } from "./actions";
import type { Unidade } from "./vendedor-form";

const initialState: { error?: string } = {};

type VendedorEditavel = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string;
  perfil: "ADMINISTRADOR" | "VENDEDOR" | "CONCESSIONARIA";
  concessionariaMarcaId: string | null;
};

export function EditarVendedorDialog({
  vendedor,
  unidades,
}: {
  vendedor: VendedorEditavel;
  unidades: Unidade[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateVendedorAction, initialState);
  const [nome, setNome] = useState(vendedor.nome);
  const [email, setEmail] = useState(vendedor.email);
  const [perfil, setPerfil] = useState<"ADMINISTRADOR" | "VENDEDOR">(
    vendedor.perfil === "ADMINISTRADOR" ? "ADMINISTRADOR" : "VENDEDOR"
  );

  const unidadeAtual = unidades.find((u) => u.id === vendedor.concessionariaMarcaId);
  const [concessionariaId, setConcessionariaId] = useState(unidadeAtual?.concessionariaId ?? "");
  const [concessionariaMarcaId, setConcessionariaMarcaId] = useState(
    vendedor.concessionariaMarcaId ?? ""
  );

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Editar</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar vendedor</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="usuarioId" value={vendedor.id} />
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
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <PhoneInput
              id="telefone"
              name="telefone"
              defaultValue={vendedor.telefone ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil</Label>
            <Select
              name="perfil"
              value={perfil}
              onValueChange={(v) => setPerfil((v ?? "VENDEDOR") as "ADMINISTRADOR" | "VENDEDOR")}
            >
              <SelectTrigger id="perfil" className="w-full">
                <SelectValue />
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
                    <SelectValue placeholder="Selecione a concessionária" />
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
                    <SelectValue placeholder="Selecione a marca" />
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
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
