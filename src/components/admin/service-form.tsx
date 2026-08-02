"use client";

import { useActionState } from "react";
import {
  createServiceAction,
  type ServiceFormState,
} from "@/app/admin/servicos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ServiceFormState = {};

export function ServiceForm() {
  const [state, formAction, pending] = useActionState(
    createServiceAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required />
          {state.fieldErrors?.name && (
            <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required />
          {state.fieldErrors?.slug && (
            <p className="text-xs text-destructive">{state.fieldErrors.slug}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" rows={3} required />
        {state.fieldErrors?.description && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            name="category"
            placeholder="Ex: Automação, Sistema Web"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="complexity">Complexidade</Label>
          <select
            id="complexity"
            name="complexity"
            defaultValue="SIMPLES"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="SIMPLES">Simples</option>
            <option value="MEDIA">Média</option>
            <option value="COMPLEXA">Complexa</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="priceType">Tipo de preço</Label>
          <select
            id="priceType"
            name="priceType"
            defaultValue="ORCAMENTO"
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="ORCAMENTO">Sob orçamento</option>
            <option value="FIXO">Preço fixo</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Preço (se fixo)</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Adicionar serviço"}
        </Button>
      </div>
    </form>
  );
}
