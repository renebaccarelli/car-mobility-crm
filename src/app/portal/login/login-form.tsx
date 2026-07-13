"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CpfInput } from "@/components/ui/cpf-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  solicitarLinkPorCpfAction,
  solicitarLinkPorEmailAction,
  type PortalLoginState,
} from "./actions";

const initialState: PortalLoginState = {};

function Confirmacao() {
  return (
    <p className="text-center text-sm text-muted-foreground">
      Se os dados informados corresponderem a um cadastro, enviamos um link de acesso para o
      e-mail cadastrado. Confira sua caixa de entrada.
    </p>
  );
}

export function PortalLoginForm() {
  const [emailState, emailAction, emailPending] = useActionState(
    solicitarLinkPorEmailAction,
    initialState
  );
  const [cpfState, cpfAction, cpfPending] = useActionState(
    solicitarLinkPorCpfAction,
    initialState
  );

  return (
    <Tabs defaultValue="email">
      <TabsList className="w-full">
        <TabsTrigger value="email" className="flex-1">
          Por e-mail
        </TabsTrigger>
        <TabsTrigger value="cpf" className="flex-1">
          Por CPF
        </TabsTrigger>
      </TabsList>

      <TabsContent value="email" className="space-y-4">
        {emailState.sucesso ? (
          <Confirmacao />
        ) : (
          <form action={emailAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail cadastrado</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            {emailState.error ? (
              <p className="text-sm text-destructive">{emailState.error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={emailPending}>
              {emailPending ? "Enviando..." : "Enviar link de acesso"}
            </Button>
          </form>
        )}
      </TabsContent>

      <TabsContent value="cpf" className="space-y-4">
        {cpfState.sucesso ? (
          <Confirmacao />
        ) : (
          <form action={cpfAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <CpfInput id="cpf" name="cpf" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de nascimento</Label>
              <Input id="dataNascimento" name="dataNascimento" type="date" required />
            </div>
            {cpfState.error ? <p className="text-sm text-destructive">{cpfState.error}</p> : null}
            <Button type="submit" className="w-full" disabled={cpfPending}>
              {cpfPending ? "Enviando..." : "Enviar link de acesso"}
            </Button>
          </form>
        )}
      </TabsContent>
    </Tabs>
  );
}
