import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { formatBRL } from "@/lib/money";
import { getStockStatus } from "@/lib/stock";
import {
  ChevronRightIcon,
  FlameIcon,
  PackageIcon,
  ShieldCheckIcon,
  TimerIcon,
  TruckIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
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

  const stock = getStockStatus(product.stockQty, product.isPreOrder);
  const avgRating = averageRating(product.reviews);
  const boundReviewAction = createReviewAction.bind(null, slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
        <Link href="/loja" className="hover:text-foreground">
          Loja
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <Link
          href={`/loja?categoria=${encodeURIComponent(product.category)}`}
          className="hover:text-foreground"
        >
          {product.category}
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
        <Reveal>
          <ProductGallery images={product.images} name={product.name} />
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-wide text-primary uppercase">
              {product.category}
            </span>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
              {product.name}
            </h1>
            {product.reviews.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <RatingStars rating={avgRating} />
                <span className="text-xs font-bold text-muted-foreground">
                  {avgRating.toFixed(1)} · {product.reviews.length} avaliação
                  {product.reviews.length > 1 ? "ões" : ""}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-gradient-brand text-2xl font-black sm:text-3xl">
              {formatBRL(product.price)}
            </span>
            {stock.isPreOrder ? (
              <Badge variant="secondary">Sob encomenda</Badge>
            ) : stock.isLow ? (
              <Badge
                variant="destructive"
                className="gap-1 border-destructive/30 bg-destructive text-destructive-foreground"
              >
                <FlameIcon className="size-3" />
                {stock.label}
              </Badge>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {stock.label}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed font-medium whitespace-pre-line text-muted-foreground">
            {product.description}
          </p>

          {stock.isPreOrder && (
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
            stockQty={product.stockQty}
            isPreOrder={product.isPreOrder}
          />

          <div className="grid grid-cols-1 gap-2.5 border-t pt-4 text-xs font-bold text-muted-foreground sm:grid-cols-3">
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
        <h2 className="font-heading text-lg font-extrabold sm:text-xl">
          Avaliações de clientes
        </h2>

        {product.reviews.length === 0 ? (
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Seja o primeiro a avaliar este produto.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">
                    {review.authorName}
                  </span>
                  <RatingStars rating={review.rating} />
                </div>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-xl border p-4 sm:p-5">
          <h3 className="font-heading text-sm font-extrabold">
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
