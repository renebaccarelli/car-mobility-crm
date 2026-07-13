"use client";

import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

function maskTelefone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (digits.length < 3) return `(${ddd}`;
  return `(${ddd}) ${rest.slice(0, 5)}${rest.length > 5 ? "-" + rest.slice(5) : ""}`;
}

export function PhoneInput({
  defaultValue,
  onChange,
  ...props
}: ComponentProps<typeof Input>) {
  const [value, setValue] = useState(() => maskTelefone(String(defaultValue ?? "")));

  return (
    <Input
      {...props}
      type="tel"
      inputMode="tel"
      placeholder={props.placeholder ?? "(xx) xxxxx-xxxx"}
      value={value}
      onChange={(e) => {
        setValue(maskTelefone(e.target.value));
        onChange?.(e);
      }}
    />
  );
}
