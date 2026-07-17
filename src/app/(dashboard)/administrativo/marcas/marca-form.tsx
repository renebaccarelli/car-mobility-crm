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
import { createMarcaAction } from "./actions";

const initialState: { error?: string } = {};

export function NovaMarcaDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createMarcaAction, initialState);

  useCloseDialogOnSuccess(isPending, Boolean(state.error), setOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Marca</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova marca</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da marca</Label>
            <Input id="nome" name="nome" required />
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
