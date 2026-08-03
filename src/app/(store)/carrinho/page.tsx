"use client";

import Link from "next/link";
import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

export default function CarrinhoPage() {
  const { items, updateQty, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Seu carrinho está vazio
        </h1>
        <p className="text-sm text-muted-foreground">
          Que tal garantir seu produto antes que o estoque acabe?
        </p>
        <Link href="/loja" className={cn(buttonVariants())}>
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold">Seu carrinho</h1>

      <div className="mt-6 flex flex-col gap-4">
        {items.map((item) => (
          <Card
            key={item.productId}
            className="flex-col items-center gap-4 p-4 sm:flex-row"
          >
            <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex w-full flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/loja/${item.slug}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remover item"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatBRL(item.price)} un.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => updateQty(item.productId, item.qty - 1)}
                >
                  <MinusIcon />
                </Button>
                <span className="w-8 text-center">{item.qty}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => updateQty(item.productId, item.qty + 1)}
                >
                  <PlusIcon />
                </Button>
                <span className="ml-auto font-medium">
                  {formatBRL(item.price * item.qty)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 border-t pt-6 sm:items-end">
        <div className="text-lg font-semibold">
          Total: {formatBRL(totalPrice)}
        </div>
        <Link
          href="/checkout"
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          Finalizar compra
        </Link>
        <p className="text-xs text-muted-foreground">
          Pagamento seguro · você só paga quando o estoque chegar
        </p>
      </div>
    </div>
  );
}
