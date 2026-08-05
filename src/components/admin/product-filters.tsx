"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { LayoutGridIcon, ListIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductFilters({
  categories,
  defaults,
}: {
  categories: string[];
  defaults: {
    busca: string;
    categoria: string;
    status: string;
    sort: string;
    view: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(defaults.busca);
  const [, startTransition] = useTransition();

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:w-64">
        <SearchIcon className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            updateParams({ busca: e.target.value });
          }}
          placeholder="Buscar por nome ou SKU..."
          className="pl-8"
        />
      </div>

      <Select
        value={defaults.categoria || "todas"}
        onValueChange={(v) => updateParams({ categoria: v && v !== "todas" ? v : "" })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas categorias</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={defaults.status || "todos"}
        onValueChange={(v) => updateParams({ status: v && v !== "todos" ? v : "" })}
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos status</SelectItem>
          <SelectItem value="ativo">Ativos</SelectItem>
          <SelectItem value="inativo">Inativos</SelectItem>
          <SelectItem value="baixo">Estoque baixo</SelectItem>
          <SelectItem value="esgotado">Esgotados</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={defaults.sort || "recentes"}
        onValueChange={(v) => updateParams({ sort: v ?? "recentes" })}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recentes">Mais recentes</SelectItem>
          <SelectItem value="nome">Nome (A-Z)</SelectItem>
          <SelectItem value="preco-desc">Maior preço</SelectItem>
          <SelectItem value="preco-asc">Menor preço</SelectItem>
          <SelectItem value="estoque">Estoque</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-0 flex items-center gap-1 rounded-lg border border-border p-0.5 sm:ml-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(defaults.view !== "grade" && "bg-muted")}
          aria-label="Ver em tabela"
          onClick={() => updateParams({ view: "tabela" })}
        >
          <ListIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(defaults.view === "grade" && "bg-muted")}
          aria-label="Ver em grade"
          onClick={() => updateParams({ view: "grade" })}
        >
          <LayoutGridIcon />
        </Button>
      </div>
    </div>
  );
}
