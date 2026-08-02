"use client";

import * as React from "react";
import { toast } from "sonner";
import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  image,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = React.useState(1);

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        className="w-16"
      />
      <Button
        type="button"
        onClick={() => {
          addItem({ productId, slug, name, price, image }, qty);
          toast.success("Produto adicionado ao carrinho");
        }}
      >
        Adicionar ao carrinho
      </Button>
    </div>
  );
}
