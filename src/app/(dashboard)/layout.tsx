import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const em3Dias = new Date();
  em3Dias.setDate(em3Dias.getDate() + 3);

  const lembretesProximos = await prisma.lembrete.findMany({
    where: {
      concluido: false,
      data: { lte: em3Dias },
      OR: [{ usuarioId: session.usuarioId }, { publico: true }],
    },
    orderBy: { data: "asc" },
    take: 10,
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar session={session} lembretesProximos={lembretesProximos} />
        <main className="flex-1 bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}
