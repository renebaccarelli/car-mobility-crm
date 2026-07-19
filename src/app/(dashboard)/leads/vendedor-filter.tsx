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
        <SelectValue placeholder="Todos os vendedores" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TODOS}>Todos os vendedores</SelectItem>
        {vendedores.map((vendedor) => (
          <SelectItem key={vendedor.id} value={vendedor.id}>
            {vendedor.nome}
            {vendedor.concessionariaNome
              ? ` — ${vendedor.concessionariaNome}${vendedor.marcaNome ? ` · ${vendedor.marcaNome}` : ""}`
              : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
