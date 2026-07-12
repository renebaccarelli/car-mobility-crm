import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_ARQUIVOS_CLIENTE = "arquivos-clientes";
const BUCKET_DOCUMENTO_TEMPLATES = "documento-templates";

const getServiceClient = createAdminClient;

export async function uploadArquivoCliente(clienteId: string, file: File) {
  const supabase = getServiceClient();
  const path = `${clienteId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from(BUCKET_ARQUIVOS_CLIENTE)
    .upload(path, file, { contentType: file.type });

  if (error) throw error;
  return path;
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
  const path = `${Date.now()}-${file.name}`;
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
