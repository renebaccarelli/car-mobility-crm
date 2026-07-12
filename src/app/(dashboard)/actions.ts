"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroySession, getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function createLembreteAction(_prevState: { error?: string }, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const texto = formData.get("texto") as string;
  const data = formData.get("data") as string;
  const publico = formData.get("publico") === "on";

  if (!texto || !data) {
    return { error: "Preencha o texto e a data do lembrete." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("lembretes").insert({
    texto,
    data: new Date(data).toISOString(),
    publico,
    usuarioId: session.usuarioId,
  });

  if (error) {
    return { error: "Não foi possível salvar o lembrete." };
  }

  revalidatePath("/inicio");
  return {};
}

export async function toggleLembreteConcluidoAction(lembreteId: string, concluido: boolean) {
  const supabase = await createClient();
  await supabase.from("lembretes").update({ concluido }).eq("id", lembreteId);
  revalidatePath("/inicio");
}
