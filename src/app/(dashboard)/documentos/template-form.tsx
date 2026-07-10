"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCloseDialogOnSuccess } from "@/hooks/use-close-dialog-on-success";
import { createDocumentoTemplateAction } from "./actions";

const initialState: { error?: string } = {};

export function NovoDocumentoTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createDocumentoTemplateAction, initialState);

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Documento</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo template de documento</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do documento</Label>
            <Input id="nome" name="nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo .docx</Label>
            <Input id="file" name="file" type="file" accept=".docx" required />
            <p className="text-xs text-muted-foreground">
              Use placeholders como <code>{"${cliente_nome}"}</code>,{" "}
              <code>{"${cliente_cpf}"}</code>, <code>{"${cliente_email}"}</code>,{" "}
              <code>{"${cliente_endereco_logradouro}"}</code> no arquivo — eles serão
              substituídos na geração.
            </p>
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Enviando..." : "Cadastrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
