import Image from "next/image";
import { CadastroForm } from "./cadastro-form";

export default function CadastroPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <Image
            src="/logo.png"
            alt="Car Mobility"
            width={124}
            height={48}
            priority
            className="mx-auto"
          />
          <p className="text-sm text-muted-foreground">Cadastro de vendedor</p>
        </div>
        <CadastroForm />
      </div>
    </div>
  );
}
