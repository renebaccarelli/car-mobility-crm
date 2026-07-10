"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { togglePedidoItemPagoAction } from "./venda-actions";

export function PedidoItemPagoToggle({
  pedidoItemId,
  clienteId,
  pago,
}: {
  pedidoItemId: string;
  clienteId: string;
  pago: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={pago}
      disabled={isPending}
      onCheckedChange={(checked) =>
        startTransition(() => {
          togglePedidoItemPagoAction(pedidoItemId, clienteId, checked);
        })
      }
    />
  );
}
