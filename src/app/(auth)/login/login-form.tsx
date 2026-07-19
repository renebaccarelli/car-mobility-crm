"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
      <div className="space-y-2">
        <Label htmlFor="identificador">E-mail ou usuário</Label>
        <Input id="identificador" name="identificador" type="text" autoComplete="username" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" name="senha" type="password" autoComplete="current-password" required />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        É vendedor e ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
