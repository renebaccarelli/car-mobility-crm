"use client";

import { useState, type ComponentProps, type FocusEvent } from "react";
import { Input } from "@/components/ui/input";
import { formatCpf, isValidCpf } from "@/lib/cpf";

export function CpfInput({
  defaultValue,
  onChange,
  onBlur,
  className,
  ...props
}: ComponentProps<typeof Input>) {
  const [value, setValue] = useState(() => formatCpf(String(defaultValue ?? "")));
  const [invalido, setInvalido] = useState(false);

  return (
    <div className="space-y-1">
      <Input
        {...props}
        inputMode="numeric"
        placeholder={props.placeholder ?? "000.000.000-00"}
        value={value}
        aria-invalid={invalido}
        className={className}
        onChange={(e) => {
          const formatted = formatCpf(e.target.value);
          setValue(formatted);
          if (invalido) setInvalido(formatted !== "" && !isValidCpf(formatted));
          onChange?.(e);
        }}
        onBlur={(e: FocusEvent<HTMLInputElement>) => {
          setInvalido(value !== "" && !isValidCpf(value));
          onBlur?.(e);
        }}
      />
      {invalido ? <p className="text-xs text-destructive">CPF inválido</p> : null}
    </div>
  );
}
