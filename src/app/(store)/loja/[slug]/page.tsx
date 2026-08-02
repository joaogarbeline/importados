import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { formatBRL } from "@/lib/money";
import { PackageIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

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
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 sm:grid-cols-2">
      <Reveal>
        <TiltCard>
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-muted shadow-xl shadow-black/10">
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
        </TiltCard>
      </Reveal>

      <Reveal delay={0.1} className="flex flex-col gap-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            {product.category}
          </span>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
            {product.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gradient-brand text-2xl font-semibold sm:text-3xl">
            {formatBRL(product.price)}
          </span>
          {isPreOrder && <Badge variant="secondary">Sob encomenda</Badge>}
        </div>

        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {product.description}
        </p>

        {isPreOrder && (
          <Alert className="border-primary/30 bg-primary/5">
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
      </Reveal>
    </div>
  );
}
