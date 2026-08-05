"use client";

import { useActionState, useState } from "react";
import { addStockAction, type AddStockState } from "@/app/admin/estoque/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: AddStockState = undefined;

export function AddStockForm({
  products,
}: {
  products: { id: string; name: string; sku: string; stockQty: number }[];
}) {
  const [state, formAction, pending] = useActionState(
    addStockAction,
    initialState
  );
  const [productId, setProductId] = useState<string | null>(null);
  const [type, setType] = useState<"entrada" | "saida">("entrada");

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={type} onValueChange={(v) => setType(v as "entrada" | "saida")}>
        <TabsList>
          <TabsTrigger value="entrada">Entrada</TabsTrigger>
          <TabsTrigger value="saida">Saída / ajuste</TabsTrigger>
        </TabsList>
      </Tabs>
      <input type="hidden" name="type" value={type} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="productId">Produto</Label>
        <Select name="productId" value={productId} onValueChange={setProductId}>
          <SelectTrigger id="productId" className="w-full">
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} (estoque atual: {product.stockQty})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="qty">
          {type === "entrada" ? "Quantidade recebida" : "Quantidade retirada"}
        </Label>
        <Input id="qty" name="qty" type="number" min="1" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reason">Motivo / observação</Label>
        <Textarea
          id="reason"
          name="reason"
          rows={2}
          placeholder={
            type === "entrada"
              ? "Ex: Chegada do fornecedor XYZ"
              : "Ex: Avaria, perda ou ajuste de inventário"
          }
          required
        />
      </div>

      <div>
        <Button type="submit" disabled={pending || !productId}>
          {pending
            ? "Salvando..."
            : type === "entrada"
              ? "Adicionar ao estoque"
              : "Registrar saída"}
        </Button>
      </div>
    </form>
  );
}
