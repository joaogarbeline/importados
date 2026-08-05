"use client";

import * as React from "react";
import { toast } from "sonner";
import { MinusIcon, PlusIcon, ShoppingCartIcon, TimerIcon } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";
import { getStockStatus } from "@/lib/stock";

export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  image,
  stockQty,
  isPreOrder,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stockQty: number;
  isPreOrder: boolean;
}) {
  const { addItem } = useCart();
  const stock = getStockStatus(stockQty, isPreOrder);
  const [qty, setQty] = React.useState(1);

  function clamp(value: number) {
    return Math.min(Math.max(1, value), stock.maxQty);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-lg border border-input bg-transparent dark:bg-input/30">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-r-none"
            onClick={() => setQty((q) => clamp(q - 1))}
            disabled={qty <= 1}
            aria-label="Diminuir quantidade"
          >
            <MinusIcon />
          </Button>
          <span className="w-10 text-center text-sm font-extrabold tabular-nums">
            {qty}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-l-none"
            onClick={() => setQty((q) => clamp(q + 1))}
            disabled={qty >= stock.maxQty}
            aria-label="Aumentar quantidade"
          >
            <PlusIcon />
          </Button>
        </div>

        <Button
          type="button"
          size="lg"
          className="flex-1 gap-2"
          onClick={() => {
            addItem(
              {
                productId,
                slug,
                name,
                price,
                image,
                maxQty: stock.isPreOrder ? undefined : stock.stockQty,
              },
              qty
            );
            toast.success(
              stock.isPreOrder
                ? "Encomenda garantida no carrinho"
                : "Produto adicionado ao carrinho"
            );
          }}
        >
          {stock.isPreOrder ? (
            <>
              <TimerIcon /> Garantir encomenda
            </>
          ) : (
            <>
              <ShoppingCartIcon /> Adicionar ao carrinho
            </>
          )}
        </Button>
      </div>

      {!stock.isPreOrder && (
        <p
          className={
            "flex items-center gap-1.5 text-xs font-bold " +
            (stock.isLow ? "text-destructive" : "text-muted-foreground")
          }
        >
          <span
            className={
              "size-1.5 rounded-full " +
              (stock.isLow ? "bg-destructive pulse-dot" : "bg-emerald-500")
            }
          />
          {stock.label}
        </p>
      )}
    </div>
  );
}
