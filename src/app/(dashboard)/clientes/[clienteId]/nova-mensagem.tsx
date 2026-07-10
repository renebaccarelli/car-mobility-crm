"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addMensagemAction } from "../actions";

export function NovaMensagemForm({ clienteId }: { clienteId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="flex gap-2"
      action={(formData) => {
        const texto = String(formData.get("texto") ?? "");
        startTransition(async () => {
          await addMensagemAction(clienteId, texto);
          formRef.current?.reset();
        });
      }}
    >
      <Input name="texto" placeholder="Escreva uma mensagem..." required />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}
