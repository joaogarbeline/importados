"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { ProductFormState } from "@/app/admin/produtos/actions";

type ProductDefaults = {
  name: string;
  slug: string;
  description: string;
  price: string;
  sku: string;
  category: string;
  stockQty: number;
  isPreOrder: boolean;
  active: boolean;
  images: string[];
};

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

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-2xl">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={defaultValues?.name} required />
          {state.fieldErrors?.name && (
            <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug} required />
          {state.fieldErrors?.slug && (
            <p className="text-xs text-destructive">{state.fieldErrors.slug}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          rows={4}
          required
        />
        {state.fieldErrors?.description && (
          <p className="text-xs text-destructive">{state.fieldErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.price}
            required
          />
          {state.fieldErrors?.price && (
            <p className="text-xs text-destructive">{state.fieldErrors.price}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={defaultValues?.sku} required />
          {state.fieldErrors?.sku && (
            <p className="text-xs text-destructive">{state.fieldErrors.sku}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            name="category"
            defaultValue={defaultValues?.category}
            required
          />
          {state.fieldErrors?.category && (
            <p className="text-xs text-destructive">{state.fieldErrors.category}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stockQty">Estoque atual</Label>
        <Input
          id="stockQty"
          name="stockQty"
          type="number"
          min="0"
          defaultValue={defaultValues?.stockQty ?? 0}
          required
        />
        <p className="text-xs text-muted-foreground">
          Para adicionar estoque e liberar pagamentos automaticamente, use a
          tela de Estoque em vez de editar esse número diretamente.
        </p>
      </div>

      <ImageUploadField
        name="images"
        label="Imagens do produto"
        defaultValue={defaultValues?.images}
      />

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPreOrder"
            defaultChecked={defaultValues?.isPreOrder ?? true}
            className="size-4"
          />
          Produto sob encomenda
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaultValues?.active ?? true}
            className="size-4"
          />
          Ativo na loja
        </label>
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
