import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/storefront/product-card";

export const metadata = { title: "Loja — Triade Importados" };

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
      include: { reviews: { select: { rating: true } } },
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
        Produtos sob encomenda com procedência garantida: garanta o seu agora
        e finalize o pagamento só quando o estoque chegar — sem surpresas.
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
            <ProductCard
              key={product.slug}
              product={product}
              delay={(i % 6) * 0.05}
            />
          ))}
        </div>
      )}
    </div>
  );
}
