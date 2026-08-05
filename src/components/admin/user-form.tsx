"use client";

import { useActionState, useState } from "react";
import type { UserFormState } from "@/app/admin/usuarios/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/generated/prisma/enums";

const initialState: UserFormState = undefined;

export function UserForm({
  action,
  submitLabel,
  mode,
  defaultValues,
}: {
  action: (prevState: UserFormState, formData: FormData) => Promise<UserFormState>;
  submitLabel: string;
  mode: "create" | "edit";
  defaultValues?: {
    name: string;
    email: string;
    phone: string | null;
    role: Role;
  };
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [role, setRole] = useState<string | null>(defaultValues?.role ?? "CUSTOMER");

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={defaultValues?.name} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={defaultValues?.email}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role">Perfil</Label>
        <Select name="role" value={role} onValueChange={setRole}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue placeholder="Selecione um perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="CUSTOMER">Cliente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">
          {mode === "create" ? "Senha" : "Nova senha"}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={mode === "edit" ? "Deixe em branco para manter a atual" : undefined}
          required={mode === "create"}
          minLength={6}
        />
      </div>

      <div>
        <Button type="submit" disabled={pending || !role}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
