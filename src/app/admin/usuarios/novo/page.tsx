import { UserForm } from "@/components/admin/user-form";
import { createUserAction } from "@/app/admin/usuarios/actions";

export default function NovoUsuarioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          Novo usuário
        </h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Crie uma conta administrativa ou de cliente.
        </p>
      </div>

      <UserForm action={createUserAction} submitLabel="Criar usuário" mode="create" />
    </div>
  );
}
