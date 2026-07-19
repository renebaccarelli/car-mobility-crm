"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type VendedorOption = {
  id: string;
  nome: string;
  concessionariaNome: string | null;
  marcaNome: string | null;
};

const TODOS = "TODOS";

function formatVendedorLabel(vendedor: VendedorOption) {
  return vendedor.concessionariaNome
    ? `${vendedor.nome} — ${vendedor.concessionariaNome}${vendedor.marcaNome ? ` · ${vendedor.marcaNome}` : ""}`
    : vendedor.nome;
}

export function VendedorFilter({
  vendedores,
  basePath,
}: {
  vendedores: VendedorOption[];
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendedorId = searchParams.get("vendedorId") ?? TODOS;

  const rotulos: Record<string, string> = { [TODOS]: "Todos os vendedores" };
  for (const vendedor of vendedores) {
    rotulos[vendedor.id] = formatVendedorLabel(vendedor);
  }

  return (
    <Select
      value={vendedorId}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === TODOS) {
          params.delete("vendedorId");
        } else {
          params.set("vendedorId", value);
        }
        const query = params.toString();
        router.push(query ? `${basePath}?${query}` : basePath);
      }}
    >
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Todos os vendedores">
          {(value: string) => rotulos[value] ?? "Todos os vendedores"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>Todos os vendedores</SelectItem>
        {vendedores.map((vendedor) => (
          <SelectItem key={vendedor.id} value={vendedor.id}>
            {formatVendedorLabel(vendedor)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
