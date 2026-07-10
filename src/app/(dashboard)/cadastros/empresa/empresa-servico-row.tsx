"use client";

import { useTransition, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { updateEmpresaServicoValorAction, toggleEmpresaServicoAction } from "../actions";

export function EmpresaServicoRow({
  id,
  empresaId,
  nome,
  valor,
  empresaPodePagar,
  ativo,
}: {
  id: string;
  empresaId: string;
  nome: string;
  valor: number;
  empresaPodePagar: boolean;
  ativo: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [valorLocal, setValorLocal] = useState(valor.toString());

  return (
    <TableRow>
      <TableCell className="font-medium">{nome}</TableCell>
      <TableCell>
        <Input
          type="number"
          step="0.01"
          min="0"
          className="h-8 w-28"
          value={valorLocal}
          onChange={(e) => setValorLocal(e.target.value)}
          onBlur={() => {
            const novoValor = Number(valorLocal);
            if (!Number.isNaN(novoValor) && novoValor > 0 && novoValor !== valor) {
              startTransition(() => {
                updateEmpresaServicoValorAction(id, empresaId, novoValor);
              });
            }
          }}
          disabled={isPending}
        />
      </TableCell>
      <TableCell className="text-center">
        <Switch
          checked={empresaPodePagar}
          disabled={isPending}
          onCheckedChange={(checked) =>
            startTransition(() => {
              toggleEmpresaServicoAction(id, empresaId, { empresaPodePagar: checked });
            })
          }
        />
      </TableCell>
      <TableCell className="text-right">
        <Switch
          checked={ativo}
          disabled={isPending}
          onCheckedChange={(checked) =>
            startTransition(() => {
              toggleEmpresaServicoAction(id, empresaId, { ativo: checked });
            })
          }
        />
      </TableCell>
    </TableRow>
  );
}
