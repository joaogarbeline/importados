"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2Icon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEBOUNCE_MS = 400;

const ORDENAR_LABELS: Record<string, string> = {
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  nome: "Nome (A-Z)",
};

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

function FilterField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-[0.7rem] font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

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
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mantém os campos de texto sincronizados quando o filtro muda por fora
  // (botão voltar do navegador, "Limpar filtros", link direto etc). Ajustado
  // durante o render, como recomendado, em vez de num useEffect.
  const [prevDefaults, setPrevDefaults] = useState(defaults);
  if (
    prevDefaults.q !== defaults.q ||
    prevDefaults.precoMin !== defaults.precoMin ||
    prevDefaults.precoMax !== defaults.precoMax
  ) {
    setPrevDefaults(defaults);
    setQ(defaults.q);
    setPrecoMin(defaults.precoMin);
    setPrecoMax(defaults.precoMax);
  }

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

  // Campos de digitação livre (busca, preço) só atualizam a URL — e disparam
  // as queries no servidor — depois que o usuário para de digitar.
  function updateParamsDebounced(next: Record<string, string>) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams(next), DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleCategoriaChange(v: string | null) {
    // Trocar de categoria invalida a subcategoria selecionada anteriormente.
    updateParams({ categoria: v && v !== "todas" ? v : "", subcategoria: "" });
  }

  function clearAll() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQ("");
    setPrecoMin("");
    setPrecoMax("");
    startTransition(() => {
      router.replace(pathname);
    });
  }

  function clearSearch() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQ("");
    updateParams({ q: "" });
  }

  function clearPrice() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPrecoMin("");
    setPrecoMax("");
    updateParams({ precoMin: "", precoMax: "" });
  }

  type ChipKind =
    | "q"
    | "categoria"
    | "subcategoria"
    | "marca"
    | "disponibilidade"
    | "preco"
    | "ordenar";

  const chips: { key: ChipKind; label: string }[] = [
    q && { key: "q" as const, label: `“${q}”` },
    defaults.categoria && { key: "categoria" as const, label: defaults.categoria },
    defaults.subcategoria && { key: "subcategoria" as const, label: defaults.subcategoria },
    defaults.marca && { key: "marca" as const, label: defaults.marca },
    defaults.disponibilidade && {
      key: "disponibilidade" as const,
      label: defaults.disponibilidade === "estoque" ? "Em estoque" : "Sob encomenda",
    },
    (precoMin || precoMax) && {
      key: "preco" as const,
      label: `R$ ${precoMin || "0"} – ${precoMax || "∞"}`,
    },
    defaults.ordenar !== "recentes" && {
      key: "ordenar" as const,
      label: ORDENAR_LABELS[defaults.ordenar] ?? defaults.ordenar,
    },
  ].filter((c): c is { key: ChipKind; label: string } => Boolean(c));

  function removeChip(kind: ChipKind) {
    switch (kind) {
      case "q":
        return clearSearch();
      case "categoria":
        return updateParams({ categoria: "", subcategoria: "" });
      case "subcategoria":
        return updateParams({ subcategoria: "" });
      case "marca":
        return updateParams({ marca: "" });
      case "disponibilidade":
        return updateParams({ disponibilidade: "" });
      case "preco":
        return clearPrice();
      case "ordenar":
        return updateParams({ ordenar: "" });
    }
  }

  return (
    <div
      className={cn(
        "mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-opacity sm:p-5",
        isPending && "opacity-70"
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <SlidersHorizontalIcon className="size-4" />
        <h2 className="text-sm font-extrabold tracking-tight text-foreground">
          Filtrar produtos
        </h2>
        {isPending && <Loader2Icon className="size-3.5 animate-spin" />}
      </div>

      <FilterField label="Buscar" className="w-full sm:max-w-xs">
        <div className="relative">
          <SearchIcon className="absolute top-2 left-2.5 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              updateParamsDebounced({ q: e.target.value });
            }}
            placeholder="Nome do produto..."
            className="pl-8 pr-8"
          />
          {q && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={clearSearch}
              className="absolute top-2 right-2.5 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
      </FilterField>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <FilterField label="Categoria">
          <Select value={defaults.categoria || "todas"} onValueChange={handleCategoriaChange}>
            <SelectTrigger className="w-full">
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
        </FilterField>

        {defaults.categoria && subcategories.length > 0 && (
          <FilterField label="Subcategoria">
            <Select
              value={defaults.subcategoria || "todas"}
              onValueChange={(v) => updateParams({ subcategoria: v && v !== "todas" ? v : "" })}
            >
              <SelectTrigger className="w-full">
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
          </FilterField>
        )}

        {brands.length > 0 && (
          <FilterField label="Marca">
            <Select
              value={defaults.marca || "todas"}
              onValueChange={(v) => updateParams({ marca: v && v !== "todas" ? v : "" })}
            >
              <SelectTrigger className="w-full">
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
          </FilterField>
        )}

        <FilterField label="Disponibilidade">
          <Select
            value={defaults.disponibilidade || "todas"}
            onValueChange={(v) => updateParams({ disponibilidade: v && v !== "todas" ? v : "" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Estoque e encomenda</SelectItem>
              <SelectItem value="estoque">Só em estoque</SelectItem>
              <SelectItem value="encomenda">Só sob encomenda</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Ordenar por">
          <Select
            value={defaults.ordenar || "recentes"}
            onValueChange={(v) => updateParams({ ordenar: v && v !== "recentes" ? v : "" })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor-preco">Menor preço</SelectItem>
              <SelectItem value="maior-preco">Maior preço</SelectItem>
              <SelectItem value="nome">Nome (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
        <FilterField label="Faixa de preço">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={precoMin}
              onChange={(e) => {
                setPrecoMin(e.target.value);
                updateParamsDebounced({ precoMin: e.target.value });
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
                updateParamsDebounced({ precoMax: e.target.value });
              }}
              placeholder="Máx."
              className="w-24"
            />
          </div>
        </FilterField>

        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
            <XIcon className="size-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
          {chips.map((chip) => (
            <Badge key={chip.key} variant="secondary" className="h-6 gap-1 pr-1 text-xs">
              {chip.label}
              <button
                type="button"
                aria-label={`Remover filtro ${chip.label}`}
                onClick={() => removeChip(chip.key)}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
