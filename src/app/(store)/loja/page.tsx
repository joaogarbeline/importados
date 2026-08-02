import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

export const metadata = { title: "Loja — Triade Sistemas e Importados" };

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const [products, categoryRows] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        ...(categoria ? { category: categoria } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ]);

  const categories = categoryRows.map((c) => c.category);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold">Loja</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A maioria dos produtos é sob encomenda: você garante o pedido e
        finaliza o pagamento assim que o estoque chegar.
      </p>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/loja"
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              !categoria
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/loja?categoria=${encodeURIComponent(cat)}`}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                categoria === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 6) * 0.05}>
              <TiltCard>
                <Link href={`/loja/${product.slug}`}>
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-xl hover:shadow-primary/10">
                    <div className="aspect-square w-full overflow-hidden bg-muted">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="size-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <CardContent className="flex flex-col gap-1 pt-3">
                      <span className="text-xs text-muted-foreground">
                        {product.category}
                      </span>
                      <span className="line-clamp-1 font-medium">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatBRL(product.price)}
                        </span>
                        {(product.isPreOrder || product.stockQty <= 0) && (
                          <Badge variant="secondary">Sob encomenda</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
