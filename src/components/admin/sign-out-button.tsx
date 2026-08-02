import { logoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm" className="gap-2">
        <LogOut className="size-4" />
        Sair
      </Button>
    </form>
  );
}
