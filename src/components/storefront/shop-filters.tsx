"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ShopFiltersDefaults = {
  q: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  disponibilidade: string;
  precoMin: string;
  precoMax: string;
  ordenar: string;
};

export function ShopFilters({
  categories,
  subcategories,
  brands,
  defaults,
  hasActiveFilters,
}: {
  categories: string[];
  subcategories: string[];
  brands: string[];
  defaults: ShopFiltersDefaults;
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(defaults.q);
  const [precoMin, setPrecoMin] = useState(defaults.precoMin);
  const [precoMax, setPrecoMax] = useState(defaults.precoMax);
  const [, startTransition] = useTransition();

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function handleCategoriaChange(v: string | null) {
    // Trocar de categoria invalida a subcategoria selecionada anteriormente.
    updateParams({ categoria: v && v !== "todas" ? v : "", subcategoria: "" });
  }

  function clearAll() {
    setQ("");
    setPrecoMin("");
    setPrecoMax("");
    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:w-56">
          <SearchIcon className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              updateParams({ q: e.target.value });
            }}
            placeholder="Buscar produto..."
            className="pl-8"
          />
        </div>

        <Select
          value={defaults.categoria || "todas"}
          onValueChange={handleCategoriaChange}
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

        {defaults.categoria && subcategories.length > 0 && (
          <Select
            value={defaults.subcategoria || "todas"}
            onValueChange={(v) => updateParams({ subcategoria: v && v !== "todas" ? v : "" })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Subcategoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas subcategorias</SelectItem>
              {subcategories.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {brands.length > 0 && (
          <Select
            value={defaults.marca || "todas"}
            onValueChange={(v) => updateParams({ marca: v && v !== "todas" ? v : "" })}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas marcas</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={defaults.disponibilidade || "todas"}
          onValueChange={(v) => updateParams({ disponibilidade: v && v !== "todas" ? v : "" })}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Disponibilidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Em estoque e sob encomenda</SelectItem>
            <SelectItem value="estoque">Só em estoque</SelectItem>
            <SelectItem value="encomenda">Só sob encomenda</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={defaults.ordenar || "recentes"}
          onValueChange={(v) => updateParams({ ordenar: v && v !== "recentes" ? v : "" })}
        >
          <SelectTrigger className="w-full sm:ml-auto sm:w-44">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recentes">Mais recentes</SelectItem>
            <SelectItem value="menor-preco">Menor preço</SelectItem>
            <SelectItem value="maior-preco">Maior preço</SelectItem>
            <SelectItem value="nome">Nome (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">Preço</span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            value={precoMin}
            onChange={(e) => {
              setPrecoMin(e.target.value);
              updateParams({ precoMin: e.target.value });
            }}
            placeholder="Mín."
            className="w-24"
          />
          <span className="text-xs text-muted-foreground">até</span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            value={precoMax}
            onChange={(e) => {
              setPrecoMax(e.target.value);
              updateParams({ precoMax: e.target.value });
            }}
            placeholder="Máx."
            className="w-24"
          />
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={clearAll}
          >
            <XIcon className="size-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
