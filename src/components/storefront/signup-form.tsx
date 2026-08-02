"use client";

import { useActionState } from "react";
import { signupAction, type SignupState } from "@/app/(store)/cadastro/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: SignupState = undefined;

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone (opcional)</Label>
        <Input id="phone" name="phone" autoComplete="tel" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
