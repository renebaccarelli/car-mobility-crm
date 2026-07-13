"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { alterarSenhaAction, type AlterarSenhaState } from "./actions";

const initialState: AlterarSenhaState = {};

export function AlterarSenhaDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, isPending] = useActionState(alterarSenhaAction, initialState);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
        </DialogHeader>
        {state.sucesso ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Senha alterada com sucesso.</p>
            <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="senhaAtual">Senha atual</Label>
              <Input id="senhaAtual" name="senhaAtual" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova senha</Label>
              <Input id="novaSenha" name="novaSenha" type="password" minLength={6} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
              <Input id="confirmarSenha" name="confirmarSenha" type="password" minLength={6} required />
            </div>
            {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Salvando..." : "Alterar senha"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
