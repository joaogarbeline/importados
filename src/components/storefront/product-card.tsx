import Link from "next/link";
import { ArrowUpRightIcon, FlameIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/money";
import { getStockStatus } from "@/lib/stock";
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
  const stock = getStockStatus(product.stockQty, product.isPreOrder);

  return (
    <Reveal delay={delay} className="h-full">
      <TiltCard className="h-full">
        <Link href={`/loja/${product.slug}`} className="group block h-full">
          <Card className="card-lift neon-border-hover h-full gap-0 overflow-hidden p-0">
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : null}

              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-1.5 p-1.5 sm:gap-2 sm:p-2.5">
                <span className="rounded-full bg-background/85 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase text-foreground backdrop-blur sm:px-2 sm:py-1 sm:text-[10px]">
                  {product.category}
                </span>
                {stock.isPreOrder ? (
                  <Badge variant="secondary" className="shrink-0 shadow-sm">
                    Sob encomenda
                  </Badge>
                ) : stock.isLow ? (
                  <Badge
                    variant="destructive"
                    className="shrink-0 gap-1 border-destructive/30 bg-destructive text-destructive-foreground shadow-sm"
                  >
                    <FlameIcon className="size-3" />
                    <span className="hidden sm:inline">Últimas unidades</span>
                    <span className="sm:hidden">Últimas</span>
                  </Badge>
                ) : null}
              </div>

              <div className="absolute inset-0 hidden items-end justify-center bg-gradient-to-t from-black/75 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
                <span className="glow-primary mb-3 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                  Ver produto <ArrowUpRightIcon className="size-3.5" />
                </span>
              </div>
            </div>

            <CardContent className="flex flex-col gap-1 p-2.5 sm:gap-1.5 sm:p-4">
              <span className="line-clamp-2 text-sm font-extrabold tracking-tight sm:line-clamp-1 sm:text-base">
                {product.name}
              </span>

              {product.reviews.length > 0 && (
                <div className="hidden items-center gap-1.5 sm:flex">
                  <RatingStars rating={averageRating(product.reviews)} />
                  <span className="text-xs font-bold text-muted-foreground">
                    ({product.reviews.length})
                  </span>
                </div>
              )}

              <span className="text-gradient-brand text-base font-black sm:text-lg">
                {formatBRL(product.price)}
              </span>

              {!stock.isPreOrder && (
                <span
                  className={
                    "flex items-center gap-1 text-[10px] font-bold sm:text-[11px] " +
                    (stock.isLow
                      ? "text-destructive"
                      : "text-muted-foreground")
                  }
                >
                  <span
                    className={
                      "stock-dot size-1.5 rounded-full " +
                      (stock.isLow
                        ? "bg-destructive pulse-dot"
                        : "bg-emerald-500")
                    }
                  />
                  {stock.isLow ? `Restam ${stock.stockQty}` : "Em estoque"}
                </span>
              )}
            </CardContent>
          </Card>
        </Link>
      </TiltCard>
    </Reveal>
  );
}
