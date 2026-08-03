import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/money";
import { RatingStars, averageRating } from "@/components/storefront/rating-stars";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

export type ProductCardData = {
  slug: string;
  name: string;
  images: string[];
  price: number | string | { toString(): string };
  isPreOrder: boolean;
  stockQty: number;
  category: string;
  reviews: { rating: number }[];
};

export function ProductCard({
  product,
  delay = 0,
}: {
  product: ProductCardData;
  delay?: number;
}) {
  const isPreOrder = product.isPreOrder || product.stockQty <= 0;

  return (
    <Reveal delay={delay} className="h-full">
      <TiltCard className="h-full">
        <Link href={`/loja/${product.slug}`} className="group block h-full">
          <Card className="neon-border-hover h-full gap-0 overflow-hidden p-0">
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : null}

              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
                <span className="rounded-full bg-background/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground backdrop-blur">
                  {product.category}
                </span>
                {isPreOrder && (
                  <Badge variant="secondary" className="shrink-0 shadow-sm">
                    Sob encomenda
                  </Badge>
                )}
              </div>

              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/75 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="glow-primary mb-3 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  Ver produto <ArrowUpRightIcon className="size-3.5" />
                </span>
              </div>
            </div>

            <CardContent className="flex flex-col gap-1.5 p-4">
              <span className="line-clamp-1 font-medium">{product.name}</span>
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={averageRating(product.reviews)} />
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews.length})
                  </span>
                </div>
              )}
              <span className="text-gradient-brand text-lg font-bold">
                {formatBRL(product.price)}
              </span>
            </CardContent>
          </Card>
        </Link>
      </TiltCard>
    </Reveal>
  );
}
