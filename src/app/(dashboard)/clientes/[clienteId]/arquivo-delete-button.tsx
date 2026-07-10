"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteArquivoAction } from "./arquivo-actions";

export function ArquivoDeleteButton({
  arquivoId,
  clienteId,
}: {
  arquivoId: string;
  clienteId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => deleteArquivoAction(arquivoId, clienteId))}
      className="text-destructive hover:opacity-70 disabled:opacity-40"
    >
      <X className="size-3.5" />
    </button>
  );
}
