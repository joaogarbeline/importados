"use client";

import { useActionState } from "react";
import { createBannerAction, type BannerFormState } from "@/app/admin/banners/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/admin/image-upload-field";

const initialState: BannerFormState = {};

export function BannerForm() {
  const [state, formAction, pending] = useActionState(
    createBannerAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <ImageUploadField name="images" label="Imagem do banner" single />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Título (opcional)</Label>
          <Input id="title" name="title" placeholder="Ex: Chegou o novo lote" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
          <Input id="subtitle" name="subtitle" placeholder="Ex: Produtos importados direto de fábrica" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="linkUrl">Link ao clicar (opcional)</Label>
          <Input id="linkUrl" name="linkUrl" placeholder="/loja" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order">Ordem</Label>
          <Input id="order" name="order" type="number" defaultValue={0} />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Adicionar banner"}
        </Button>
      </div>
    </form>
  );
}
