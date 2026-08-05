import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/admin/user-form";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { updateUserAction } from "@/app/admin/usuarios/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const boundAction = updateUserAction.bind(null, user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          Editar usuário
        </h1>
        <p className="text-sm font-semibold text-muted-foreground">{user.email}</p>
      </div>

      <UserForm
        action={boundAction}
        submitLabel="Salvar alterações"
        mode="edit"
        defaultValues={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        }}
      />

      <Card className="max-w-lg border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Zona de risco</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Excluir a conta é permanente. Usuários com pedidos vinculados não
            podem ser excluídos — rebaixe o perfil para Cliente se necessário.
          </p>
          <Separator />
          <div>
            <DeleteUserButton userId={user.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
