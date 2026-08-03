"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useCart } from "@/components/storefront/cart-provider";
import { checkoutAction, type CheckoutState } from "@/app/(store)/checkout/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

const initialState: CheckoutState = undefined;

export function CheckoutForm() {
  const { items, totalPrice } = useCart();
  const [state, formAction, pending] = useActionState(
    checkoutAction,
    initialState
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        <Link href="/loja" className={cn(buttonVariants())}>
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-8 sm:grid-cols-2">
      <input type="hidden" name="items" value={JSON.stringify(
        items.map((i) => ({ productId: i.productId, qty: i.qty }))
      )} />

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">
          Endereço de entrega
        </h2>

        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" name="cep" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="uf">UF</Label>
            <Input id="uf" name="uf" maxLength={2} required />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rua">Rua</Label>
          <Input id="rua" name="rua" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" name="numero" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" name="complemento" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bairro">Bairro</Label>
          <Input id="bairro" name="bairro" required />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" name="cidade" required />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">Resumo do pedido</h2>
        <Card className="flex flex-col gap-3 p-4">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.qty}x {item.name}
              </span>
              <span>{formatBRL(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span>{formatBRL(totalPrice)}</span>
          </div>
        </Card>

        <Alert className="border-primary/30 bg-primary/5">
          <AlertDescription>
            Zero risco: itens sob encomenda só serão cobrados quando o
            estoque chegar — você recebe um e-mail com o link de pagamento
            na hora certa, por ordem de chegada do pedido.
          </AlertDescription>
        </Alert>

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Enviando pedido..." : "Confirmar e garantir meu pedido"}
        </Button>
      </div>
    </form>
  );
}
