"use client";

import Link from "next/link";
import { ShoppingCartIcon, MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { useCart } from "@/components/storefront/cart-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

export function CartSheet() {
  const { items, totalQty, totalPrice, updateQty, removeItem } = useCart();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Abrir carrinho" />
        }
      >
        <span className="relative">
          <ShoppingCartIcon className="size-4" />
          {totalQty > 0 && (
            <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {totalQty}
            </span>
          )}
        </span>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>Seu carrinho</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">
            Seu carrinho está vazio.
          </p>
        ) : (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3 border-b pb-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/loja/${item.slug}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Remover item"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatBRL(item.price)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                    >
                      <MinusIcon />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.qty}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <SheetFooter className="gap-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total</span>
            <span>{formatBRL(totalPrice)}</span>
          </div>
          <Link
            href="/checkout"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full",
              items.length === 0 && "pointer-events-none opacity-50"
            )}
          >
            Finalizar compra
          </Link>
          <Link
            href="/carrinho"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Ver carrinho completo
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
