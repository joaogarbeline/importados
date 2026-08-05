import { requireAdmin } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { AdminGlobalSearch } from "@/components/admin/global-search";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const initials =
    (user.name ?? "")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="dark no-print hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <div className="border-b border-sidebar-border px-4 py-4">
          <Logo tagline="Painel administrativo" />
        </div>
        <AdminSidebar />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <AdminMobileNav />
            <Logo tagline={false} className="scale-90" />
          </div>

          <AdminGlobalSearch />

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-bold">{user.name}</p>
              <p className="text-xs leading-tight font-semibold text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Avatar className="border border-border">
              <AvatarFallback className="bg-primary font-extrabold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
