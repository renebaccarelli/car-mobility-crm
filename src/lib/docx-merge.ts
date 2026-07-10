import "server-only";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export function mergeDocxTemplate(templateBuffer: Buffer, data: Record<string, string>) {
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "${", end: "}" },
    nullGetter: () => "",
  });

  doc.render(data);

  return doc.getZip().generate({ type: "nodebuffer" }) as Buffer;
}

export function clienteParaPlaceholders(cliente: {
  nome: string;
  cpf: string | null;
  rg: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  endereco: {
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    municipio: string | null;
    estado: string | null;
    cep: string | null;
  } | null;
}): Record<string, string> {
  return {
    cliente_nome: cliente.nome,
    cliente_cpf: cliente.cpf ?? "",
    cliente_rg: cliente.rg ?? "",
    cliente_email: cliente.email ?? "",
    cliente_telefone_principal: cliente.telefone ?? "",
    cliente_telefone_whatsapp: cliente.whatsapp ?? "",
    cliente_endereco_logradouro: cliente.endereco?.logradouro ?? "",
    cliente_endereco_numero: cliente.endereco?.numero ?? "",
    cliente_endereco_complemento: cliente.endereco?.complemento ?? "",
    cliente_endereco_bairro: cliente.endereco?.bairro ?? "",
    cliente_endereco_municipio: cliente.endereco?.municipio ?? "",
    cliente_endereco_estado: cliente.endereco?.estado ?? "",
    cliente_endereco_cep: cliente.endereco?.cep ?? "",
  };
}
