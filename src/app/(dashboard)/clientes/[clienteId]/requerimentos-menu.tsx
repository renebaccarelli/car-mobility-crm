"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Template = { id: string; nome: string };

export function RequerimentosMenu({
  clienteId,
  templates,
}: {
  clienteId: string;
  templates: Template[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        Requerimentos
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {templates.length === 0 ? (
          <DropdownMenuItem disabled>Nenhum documento cadastrado</DropdownMenuItem>
        ) : (
          templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              render={
                <a href={`/api/requerimentos?templateId=${template.id}&clienteId=${clienteId}`} />
              }
            >
              {template.nome}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
