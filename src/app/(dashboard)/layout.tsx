import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data: lembretesProximos } = await supabase
    .from("lembretes")
    .select("*")
    .eq("concluido", false)
    .lte("data", em3Dias.toISOString())
    .or(`usuarioId.eq.${session.usuarioId},publico.eq.true`)
    .order("data", { ascending: true })
    .limit(10);

  return (
    <div className="flex min-h-screen">
      <Sidebar perfil={session.perfil} />
      <div className="flex flex-1 flex-col">
        <Topbar session={session} lembretesProximos={lembretesProximos ?? []} />
        <main className="flex-1 bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}
