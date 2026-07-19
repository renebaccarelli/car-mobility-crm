import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ETAPA_PROCESSO_LABELS } from "@/lib/labels";

function diasAtras(data: string) {
  const dias = Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24));
  if (dias <= 0) return "hoje";
  return `${dias} dia${dias === 1 ? "" : "s"} atrás`;
}

export type ClienteRow = {
  id: string;
  nome: string;
  etapaAtual: keyof typeof ETAPA_PROCESSO_LABELS;
  createdAt: string;
  usuarios:
    | {
        nome: string;
        concessionariaMarca?: {
          concessionaria: { nome: string } | null;
          marca: { nome: string } | null;
        } | null;
      }
    | null;
  pedidos: { id: string }[];
};

const PERIODOS = [
  { label: "Todos", value: "" },
  { label: "Hoje", value: "hoje" },
  { label: "Ontem", value: "ontem" },
  { label: "3 dias", value: "3" },
  { label: "7 dias", value: "7" },
  { label: "+30 dias", value: "30" },
];

export function PeriodoFilter({
  basePath,
  ativo,
  extraQuery,
}: {
  basePath: string;
  ativo: string;
  extraQuery?: Record<string, string>;
}) {
  const buildHref = (periodoValue: string) => {
    const params = new URLSearchParams(extraQuery);
    if (periodoValue) params.set("periodo", periodoValue);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className="flex gap-1">
      {PERIODOS.map((periodo) => (
        <Link
          key={periodo.value}
          href={buildHref(periodo.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            ativo === periodo.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          {periodo.label}
        </Link>
      ))}
    </div>
  );
}

export function ClientesTable({
  clientes,
  detailBasePath,
}: {
  clientes: ClienteRow[];
  detailBasePath: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Vendedor</TableHead>
          <TableHead>Etapa atual</TableHead>
          <TableHead>Dias do cadastro</TableHead>
          <TableHead>Vendas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id}>
            <TableCell>
              <Link href={`${detailBasePath}/${cliente.id}`} className="font-medium hover:underline">
                {cliente.nome}
              </Link>
            </TableCell>
            <TableCell>
              <div>{cliente.usuarios?.nome ?? "Sem vendedor"}</div>
              {cliente.usuarios?.concessionariaMarca ? (
                <div className="text-xs text-muted-foreground">
                  {cliente.usuarios.concessionariaMarca.concessionaria?.nome}
                  {cliente.usuarios.concessionariaMarca.marca?.nome
                    ? ` · ${cliente.usuarios.concessionariaMarca.marca.nome}`
                    : ""}
                </div>
              ) : null}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{ETAPA_PROCESSO_LABELS[cliente.etapaAtual]}</Badge>
            </TableCell>
            <TableCell>{diasAtras(cliente.createdAt)}</TableCell>
            <TableCell>{cliente.pedidos.length} vendas</TableCell>
          </TableRow>
        ))}
        {clientes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              Nenhum registro encontrado.
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}
