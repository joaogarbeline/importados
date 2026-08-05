"use client";

import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

export function AdminGlobalSearch() {
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const value = new FormData(e.currentTarget).get("q");
        if (typeof value === "string" && value.trim()) {
          router.push(`/admin/produtos?busca=${encodeURIComponent(value.trim())}`);
        }
      }}
      className="hidden w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors focus-within:border-primary/40 focus-within:bg-background sm:flex"
    >
      <SearchIcon className="size-4 shrink-0" />
      <input
        name="q"
        placeholder="Buscar produtos, SKU..."
        className="w-full bg-transparent font-semibold text-foreground outline-none placeholder:text-muted-foreground placeholder:font-medium"
      />
    </form>
  );
}
