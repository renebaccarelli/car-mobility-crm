"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadArquivoAction } from "./arquivo-actions";

export function UploadArquivoForm({ clienteId }: { clienteId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="flex items-center gap-2"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await uploadArquivoAction({}, formData);
          if (result?.error) {
            setError(result.error);
          } else {
            formRef.current?.reset();
          }
        });
      }}
    >
      <input type="hidden" name="clienteId" value={clienteId} />
      <Input name="file" type="file" required className="text-sm" />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
