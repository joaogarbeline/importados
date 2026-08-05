"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductFormState } from "@/app/admin/produtos/actions";

type ProductDefaults = {
  name: string;
  slug: string;
  description: string;
  price: string;
  costPrice: string | null;
  sku: string;
  barcode: string | null;
  category: string;
  stockQty: number;
  isPreOrder: boolean;
  active: boolean;
  images: string[];
  brand: string | null;
  model: string | null;
  color: string | null;
  capacity: string | null;
  warranty: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}

export function ProductForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaultValues?: Partial<ProductDefaults>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [price, setPrice] = useState(defaultValues?.price ?? "");
  const [costPrice, setCostPrice] = useState(defaultValues?.costPrice ?? "");

  const margin = useMemo(() => {
    const p = Number(price);
    const c = Number(costPrice);
    if (!p || !costPrice) return null;
    const profit = p - c;
    return { profit, pct: (profit / p) * 100 };
  }, [price, costPrice]);

  const fe = state.fieldErrors;

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-5">
      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-bold text-destructive">
          {state.error}
        </p>
      )}

      <Tabs defaultValue="geral">
        <TabsList className="w-full">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="preco">Preço &amp; estoque</TabsTrigger>
          <TabsTrigger value="specs">Especificações</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="name" error={fe?.name}>
              <Input id="name" name="name" defaultValue={defaultValues?.name} required />
            </Field>
            <Field label="Slug (URL)" htmlFor="slug" error={fe?.slug}>
              <Input id="slug" name="slug" defaultValue={defaultValues?.slug} required />
            </Field>
          </div>

          <Field label="Categoria" htmlFor="category" error={fe?.category}>
            <Input id="category" name="category" defaultValue={defaultValues?.category} required />
          </Field>

          <Field label="Descrição" htmlFor="description" error={fe?.description}>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaultValues?.description}
              rows={5}
              required
            />
          </Field>

          <div className="flex flex-wrap gap-6 border-t pt-4">
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                name="isPreOrder"
                defaultChecked={defaultValues?.isPreOrder ?? true}
                className="size-4 accent-primary"
              />
              Produto sob encomenda
            </label>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                name="active"
                defaultChecked={defaultValues?.active ?? true}
                className="size-4 accent-primary"
              />
              Ativo na loja
            </label>
          </div>
        </TabsContent>

        <TabsContent value="preco" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Preço de custo (R$)" htmlFor="costPrice">
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </Field>
            <Field label="Preço de venda (R$)" htmlFor="price" error={fe?.price}>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Field>
          </div>

          <div
            className={cn(
              "flex flex-col gap-1 rounded-lg border p-3",
              margin
                ? margin.pct >= 0
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5"
                : "border-border bg-muted/40"
            )}
          >
            <span className="text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
              Margem de lucro (calculada automaticamente)
            </span>
            {margin ? (
              <span
                className={cn(
                  "text-lg font-extrabold tabular-nums",
                  margin.pct >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {formatBRL(margin.profit)} · {margin.pct.toFixed(1)}%
              </span>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                Informe custo e preço de venda para calcular
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="SKU" htmlFor="sku" error={fe?.sku}>
              <Input id="sku" name="sku" defaultValue={defaultValues?.sku} required />
            </Field>
            <Field label="Código de barras (GTIN/EAN)" htmlFor="barcode">
              <Input id="barcode" name="barcode" defaultValue={defaultValues?.barcode ?? ""} />
            </Field>
          </div>

          <Field label="Estoque atual" htmlFor="stockQty">
            <Input
              id="stockQty"
              name="stockQty"
              type="number"
              min="0"
              defaultValue={defaultValues?.stockQty ?? 0}
              required
            />
          </Field>
          <p className="-mt-2 text-xs font-semibold text-muted-foreground">
            Para adicionar estoque e liberar pagamentos automaticamente, use a
            tela de Estoque em vez de editar esse número diretamente.
          </p>
        </TabsContent>

        <TabsContent value="specs" className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Marca" htmlFor="brand">
              <Input id="brand" name="brand" defaultValue={defaultValues?.brand ?? ""} />
            </Field>
            <Field label="Modelo" htmlFor="model">
              <Input id="model" name="model" defaultValue={defaultValues?.model ?? ""} />
            </Field>
            <Field label="Cor" htmlFor="color">
              <Input id="color" name="color" defaultValue={defaultValues?.color ?? ""} />
            </Field>
            <Field label="Capacidade / memória" htmlFor="capacity">
              <Input
                id="capacity"
                name="capacity"
                placeholder="Ex: 256GB"
                defaultValue={defaultValues?.capacity ?? ""}
              />
            </Field>
            <Field label="Garantia" htmlFor="warranty">
              <Input
                id="warranty"
                name="warranty"
                placeholder="Ex: 12 meses"
                defaultValue={defaultValues?.warranty ?? ""}
              />
            </Field>
          </div>
        </TabsContent>

        <TabsContent value="imagens" className="flex flex-col gap-4 pt-4">
          <ImageUploadField
            name="images"
            label="Imagens do produto"
            defaultValue={defaultValues?.images}
          />
        </TabsContent>

        <TabsContent value="seo" className="flex flex-col gap-4 pt-4">
          <Field label="Meta título" htmlFor="metaTitle">
            <Input id="metaTitle" name="metaTitle" defaultValue={defaultValues?.metaTitle ?? ""} />
          </Field>
          <Field label="Meta descrição" htmlFor="metaDescription">
            <Textarea
              id="metaDescription"
              name="metaDescription"
              rows={3}
              defaultValue={defaultValues?.metaDescription ?? ""}
            />
          </Field>
        </TabsContent>
      </Tabs>

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
