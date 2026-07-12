import { PortalLoginForm } from "./login-form";

export default function PortalLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Car Mobility CRM</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento de Serviços</p>
        </div>
        <PortalLoginForm />
      </div>
    </div>
  );
}
