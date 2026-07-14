"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { criarUploadUrlAction, registrarArquivoAction } from "./arquivo-actions";

const BUCKET_ARQUIVOS_CLIENTE = "arquivos-clientes";

export function UploadArquivoForm({ clienteId }: { clienteId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [progresso, setProgresso] = useState<{ atual: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function enviarArquivos(files: FileList) {
    setError(null);
    const arquivos = Array.from(files);
    startTransition(async () => {
      const falhas: string[] = [];

      for (let i = 0; i < arquivos.length; i++) {
        const file = arquivos[i];
        setProgresso({ atual: i + 1, total: arquivos.length });

        const prep = await criarUploadUrlAction(clienteId, file.name);
        if (prep.error || !prep.path || !prep.token) {
          falhas.push(file.name);
          continue;
        }

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_ARQUIVOS_CLIENTE)
          .uploadToSignedUrl(prep.path, prep.token, file);

        if (uploadError) {
          falhas.push(file.name);
          continue;
        }

        const registro = await registrarArquivoAction(clienteId, prep.path, file.name);
        if (registro.error) falhas.push(file.name);
      }

      setProgresso(null);
      if (falhas.length > 0) {
        setError(`Não foi possível enviar: ${falhas.join(", ")}`);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        name="file"
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) enviarArquivos(e.target.files);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Paperclip className="size-4" />
        )}
        {isPending
          ? `Enviando ${progresso?.atual ?? 1} de ${progresso?.total ?? 1}...`
          : "Anexar documentos"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
