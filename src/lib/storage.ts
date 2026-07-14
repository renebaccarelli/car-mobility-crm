import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_ARQUIVOS_CLIENTE = "arquivos-clientes";
const BUCKET_DOCUMENTO_TEMPLATES = "documento-templates";

const getServiceClient = createAdminClient;

// O Storage do Supabase rejeita chaves de objeto com acentos/caracteres
// não-ASCII ("Invalid key"). O nome original (com acento) continua sendo
// exibido normalmente — só o caminho salvo no bucket precisa ser seguro.
function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w.-]/g, "_");
}

// Gera uma URL assinada para o navegador enviar o arquivo direto pro
// Storage, sem passar pela Server Action — evita o limite de tamanho de
// requisição das funções serverless (ex.: 4,5MB na Vercel).
export async function createArquivoClienteUploadUrl(clienteId: string, fileName: string) {
  const supabase = getServiceClient();
  const sufixo = Math.random().toString(36).slice(2, 8);
  const path = `${clienteId}/${Date.now()}-${sufixo}-${sanitizeFileName(fileName)}`;
  const { data, error } = await supabase.storage
    .from(BUCKET_ARQUIVOS_CLIENTE)
    .createSignedUploadUrl(path);

  if (error) throw error;
  return { path, token: data.token };
}

export async function getArquivoClienteUrl(path: string) {
  const supabase = getServiceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_ARQUIVOS_CLIENTE)
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteArquivoCliente(path: string) {
  const supabase = getServiceClient();
  await supabase.storage.from(BUCKET_ARQUIVOS_CLIENTE).remove([path]);
}

export async function uploadDocumentoTemplate(file: File) {
  const supabase = getServiceClient();
  const path = `${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET_DOCUMENTO_TEMPLATES)
    .upload(path, file, { contentType: file.type });

  if (error) throw error;
  return path;
}

export async function downloadDocumentoTemplate(path: string) {
  const supabase = getServiceClient();
  const { data, error } = await supabase.storage.from(BUCKET_DOCUMENTO_TEMPLATES).download(path);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}
