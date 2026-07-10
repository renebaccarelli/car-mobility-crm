"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroySession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

  await prisma.lembrete.create({
    data: {
      texto,
      data: new Date(data),
      publico,
      usuarioId: session.usuarioId,
    },
  });

  revalidatePath("/inicio");
  return {};
}

export async function toggleLembreteConcluidoAction(lembreteId: string, concluido: boolean) {
  await prisma.lembrete.update({ where: { id: lembreteId }, data: { concluido } });
  revalidatePath("/inicio");
}
