import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NovaTarefaDialog } from "./nova-tarefa-form";
import { TarefaStatusSelect } from "./tarefa-status-select";
import type { StatusTarefa } from "@prisma/client";

type Tarefa = {
  id: string;
  titulo: string;
  status: StatusTarefa;
  iniciadoEm: string | null;
  encerradoEm: string | null;
};

function formatarDataHora(data: string | null) {
  if (!data) return "—";
  return new Date(data).toLocaleString("pt-BR");
}

export function TarefasCard({ clienteId, tarefas }: { clienteId: string; tarefas: Tarefa[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Tarefas</CardTitle>
        <NovaTarefaDialog clienteId={clienteId} />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Iniciado em</TableHead>
              <TableHead>Encerrado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tarefas.map((tarefa) => (
              <TableRow key={tarefa.id}>
                <TableCell>{tarefa.titulo}</TableCell>
                <TableCell>
                  <TarefaStatusSelect
                    tarefaId={tarefa.id}
                    clienteId={clienteId}
                    status={tarefa.status}
                  />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatarDataHora(tarefa.iniciadoEm)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatarDataHora(tarefa.encerradoEm)}
                </TableCell>
              </TableRow>
            ))}
            {tarefas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma tarefa registrada.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
