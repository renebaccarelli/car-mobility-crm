"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { deleteDocumentoTemplateAction } from "./actions";

export function DeleteTemplateButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      onClick={() => startTransition(() => deleteDocumentoTemplateAction(id))}
    >
      <X className="size-4 text-destructive" />
    </Button>
  );
}
