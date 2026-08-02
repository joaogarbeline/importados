import Link from "next/link";
import { UserIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { CartSheet } from "@/components/storefront/cart-sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/(store)/actions";

const NAV_LINKS = [
  { href: "/loja", label: "Loja" },
  { href: "/servicos", label: "Serviços" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-heading text-sm font-semibold">
          Triade <span className="text-muted-foreground">Sistemas e Importados</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartSheet />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="icon" />}
              >
                <UserIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/minha-conta">Minha conta</Link>}
                />
                {user.role === "ADMIN" && (
                  <DropdownMenuItem
                    render={<Link href="/admin">Painel admin</Link>}
                  />
                )}
                <DropdownMenuSeparator />
                <form action={signOutAction}>
                  <DropdownMenuItem
                    render={<button type="submit" className="w-full" />}
                  >
                    Sair
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
