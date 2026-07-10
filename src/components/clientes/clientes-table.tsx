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

function diasAtras(data: Date) {
  const dias = Math.floor((Date.now() - data.getTime()) / (1000 * 60 * 60 * 24));
  if (dias <= 0) return "hoje";
  return `${dias} dia${dias === 1 ? "" : "s"} atrás`;
}

export type ClienteRow = {
  id: string;
  nome: string;
  etapaAtual: keyof typeof ETAPA_PROCESSO_LABELS;
  createdAt: Date;
  empresa: { nome: string } | null;
  consultor: { nome: string } | null;
  _count: { pedidos: number };
};

const PERIODOS = [
  { label: "Todos", value: "" },
  { label: "Hoje", value: "hoje" },
  { label: "Ontem", value: "ontem" },
  { label: "3 dias", value: "3" },
  { label: "7 dias", value: "7" },
  { label: "+30 dias", value: "30" },
];

export function PeriodoFilter({ basePath, ativo }: { basePath: string; ativo: string }) {
  return (
    <div className="flex gap-1">
      {PERIODOS.map((periodo) => (
        <Link
          key={periodo.value}
          href={periodo.value ? `${basePath}?periodo=${periodo.value}` : basePath}
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
          <TableHead>Concessionária</TableHead>
          <TableHead>Consultor</TableHead>
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
            <TableCell>{cliente.empresa?.nome ?? "Sem concessionária"}</TableCell>
            <TableCell>{cliente.consultor?.nome ?? "Sem consultor"}</TableCell>
            <TableCell>
              <Badge variant="outline">{ETAPA_PROCESSO_LABELS[cliente.etapaAtual]}</Badge>
            </TableCell>
            <TableCell>{diasAtras(cliente.createdAt)}</TableCell>
            <TableCell>{cliente._count.pedidos} vendas</TableCell>
          </TableRow>
        ))}
        {clientes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Nenhum registro encontrado.
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}
