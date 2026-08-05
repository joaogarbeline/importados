"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteUserAction } from "@/app/admin/usuarios/actions";

export function DeleteUserButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Excluir este usuário? Essa ação não pode ser desfeita.")) return;

    startTransition(async () => {
      try {
        await deleteUserAction(userId);
        toast.success("Usuário excluído.");
        router.push("/admin/usuarios");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível excluir.");
      }
    });
  }

  return (
    <Button type="button" variant="destructive" disabled={pending} onClick={handleDelete}>
      <TrashIcon className="size-3.5" />
      {pending ? "Excluindo..." : "Excluir usuário"}
    </Button>
  );
}
