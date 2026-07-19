"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

function formatMoeda(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CurrencyInput({
  name,
  defaultValue,
  id,
  className,
  disabled,
}: {
  name: string;
  defaultValue?: string | number;
  id?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [centavos, setCentavos] = useState(() => Math.round(Number(defaultValue ?? 0) * 100));

  return (
    <>
      <Input
        id={id}
        inputMode="numeric"
        placeholder="R$ 0,00"
        value={centavos === 0 ? "" : formatMoeda(centavos)}
        className={className}
        disabled={disabled}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          setCentavos(digits === "" ? 0 : parseInt(digits, 10));
        }}
      />
      <input type="hidden" name={name} value={(centavos / 100).toFixed(2)} />
    </>
  );
}
