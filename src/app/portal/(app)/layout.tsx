import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { logoutPortalAction } from "../actions";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex h-16 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-primary">Car</span>
          <span className="text-lg font-semibold text-muted-foreground">Mobility</span>
          <span className="ml-2 text-sm text-muted-foreground">Acompanhamento de Serviços</span>
        </div>
        <form action={logoutPortalAction}>
          <Button variant="outline" size="sm" type="submit">
            Sair
          </Button>
        </form>
      </header>
      <main className="mx-auto max-w-3xl p-6">{children}</main>
    </div>
  );
}
