import { requireAdmin } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
        <div className="border-b px-4 py-4">
          <p className="text-sm font-semibold leading-tight">
            Triade Sistemas e Importados
          </p>
          <p className="text-xs text-muted-foreground">Painel administrativo</p>
        </div>
        <AdminSidebar />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <AdminMobileNav />
            <p className="text-sm font-semibold">Triade Admin</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {user.email}
              </p>
            </div>
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
