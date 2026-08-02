import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { formatBRL } from "@/lib/money";
import { PackageIcon } from "lucide-react";

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product || !product.active) notFound();

  const isPreOrder = product.isPreOrder || product.stockQty <= 0;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <PackageIcon className="size-10" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <span className="text-xs text-muted-foreground">
            {product.category}
          </span>
          <h1 className="font-heading text-2xl font-semibold">
            {product.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold">
            {formatBRL(product.price)}
          </span>
          {isPreOrder && <Badge variant="secondary">Sob encomenda</Badge>}
        </div>

        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {product.description}
        </p>

        {isPreOrder && (
          <Alert>
            <AlertTitle>Produto sob encomenda</AlertTitle>
            <AlertDescription>
              Você garante seu pedido agora e não paga nada de imediato. Assim
              que o estoque chegar, avisamos por e-mail com o link de
              pagamento — os pedidos são atendidos por ordem de chegada.
            </AlertDescription>
          </Alert>
        )}

        <AddToCartButton
          productId={product.id}
          slug={product.slug}
          name={product.name}
          price={Number(product.price)}
          image={product.images[0] ?? null}
        />
      </div>
    </div>
  );
}
