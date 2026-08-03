import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { formatBRL } from "@/lib/money";
import { PackageIcon, ShieldCheckIcon, TimerIcon, TruckIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { RatingStars, averageRating } from "@/components/storefront/rating-stars";
import { ReviewForm } from "@/components/storefront/review-form";
import { createReviewAction } from "./actions";

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { reviews: { orderBy: { createdAt: "desc" } } },
  });

  if (!product || !product.active) notFound();

  const isPreOrder = product.isPreOrder || product.stockQty <= 0;
  const avgRating = averageRating(product.reviews);
  const boundReviewAction = createReviewAction.bind(null, slug);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
        <Reveal>
          <TiltCard>
            <div className="neon-border aspect-square w-full overflow-hidden rounded-2xl bg-muted shadow-xl shadow-black/10">
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
            {product.reviews.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <RatingStars rating={avgRating} />
                <span className="text-xs text-muted-foreground">
                  {avgRating.toFixed(1)} · {product.reviews.length} avaliação
                  {product.reviews.length > 1 ? "ões" : ""}
                </span>
              </div>
            )}
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
              <TimerIcon className="size-4 text-primary" />
              <AlertTitle>Garanta já o seu — vagas por ordem de chegada</AlertTitle>
              <AlertDescription>
                Você garante seu pedido agora e não paga nada de imediato.
                Assim que o estoque chegar, avisamos por e-mail com o link de
                pagamento — os pedidos são atendidos por ordem de chegada, então
                quanto antes você garantir, mais cedo recebe o seu.
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

          <div className="grid grid-cols-1 gap-2 border-t pt-4 text-xs text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="size-4 shrink-0 text-primary" />
              Compra 100% segura
            </div>
            <div className="flex items-center gap-1.5">
              <TruckIcon className="size-4 shrink-0 text-primary" />
              Entrega rastreada
            </div>
            <div className="flex items-center gap-1.5">
              <PackageIcon className="size-4 shrink-0 text-primary" />
              Produto original
            </div>
          </div>
        </Reveal>
      </div>

      <section className="mt-14 max-w-2xl">
        <h2 className="font-heading text-lg font-semibold sm:text-xl">
          Avaliações de clientes
        </h2>

        {product.reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Seja o primeiro a avaliar este produto.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {review.authorName}
                  </span>
                  <RatingStars rating={review.rating} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-xl border p-4 sm:p-5">
          <h3 className="font-heading text-sm font-semibold">
            Deixe sua avaliação
          </h3>
          <div className="mt-3">
            <ReviewForm action={boundReviewAction} />
          </div>
        </div>
      </section>
    </div>
  );
}
