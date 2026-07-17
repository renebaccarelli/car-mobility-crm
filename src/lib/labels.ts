import type {
  CategoriaServico,
  EtapaProcesso,
  MetodoPagamento,
  PreferenciaContato,
  TipoPerfil,
} from "@prisma/client";

export const CATEGORIA_SERVICO_LABELS: Record<CategoriaServico, string> = {
  RECOMENDADOS: "Recomendados",
  CNH: "CNH's",
  LAUDOS: "Laudos",
  ISENCOES: "Isenções",
};

export const METODO_PAGAMENTO_LABELS: Record<MetodoPagamento, string> = {
  CREDITO: "Crédito",
  BOLETO: "Boleto",
  DEBITO: "Débito",
  TEF_DOC_TRANSFERENCIA_PIX: "TEF / DOC / Transferência / PIX",
  NF_CONCESSIONARIA: "NF Concessionária",
  DINHEIRO: "Dinheiro",
  DEPOSITO: "Depósito",
  CHEQUE: "Cheque",
};

export const PERFIL_LABELS: Record<TipoPerfil, string> = {
  ADMINISTRADOR: "Administrador",
  VENDEDOR: "Vendedor",
  CONCESSIONARIA: "Concessionária",
};

// Ordem também representa a sequência do pipeline exibido na ficha do cliente.
export const ETAPA_PROCESSO_ORDEM: EtapaProcesso[] = [
  "NAO_SE_APLICA",
  "INICIAL",
  "RELATORIO_MEDICO",
  "CNH_ESPECIAL",
  "LAUDO_RECEITA_FEDERAL",
  "RENOVACAO_CNH",
  "IPI",
  "ICMS",
  "PEDIDO_VEICULO",
  "FATURAMENTO",
  "LICENCIAMENTO",
  "IPVA",
  "RODIZIO",
  "CARTAO_DEFIS",
  "ENTREGA_VEICULO",
];

export const ETAPA_PROCESSO_LABELS: Record<EtapaProcesso, string> = {
  NAO_SE_APLICA: "Não se aplica",
  INICIAL: "Inicial",
  RELATORIO_MEDICO: "Relatório Médico",
  CNH_ESPECIAL: "CNH Especial",
  LAUDO_RECEITA_FEDERAL: "Laudo Receita Federal",
  RENOVACAO_CNH: "Renovação CNH",
  IPI: "IPI",
  ICMS: "ICMS",
  PEDIDO_VEICULO: "Pedido Veículo",
  FATURAMENTO: "Faturamento",
  LICENCIAMENTO: "Licenciamento",
  IPVA: "IPVA",
  RODIZIO: "Rodízio",
  CARTAO_DEFIS: "Cartão DEFIS",
  ENTREGA_VEICULO: "Entrega veículo",
};

export const PREFERENCIA_CONTATO_LABELS: Record<PreferenciaContato, string> = {
  TELEFONE: "Telefone",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
};
