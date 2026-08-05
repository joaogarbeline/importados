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
      orderBy: [{ category: "asc" }, { subcategory: "asc" }, { createdAt: "desc" }],
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

  // Agrupa por categoria e, dentro dela, por subcategoria (produtos sem
  // subcategoria caem em um grupo "Outros" só quando a categoria tem
  // subcategorias definidas — senão a grade aparece direto).
  const grouped = new Map<string, Map<string, typeof products>>();
  for (const product of products) {
    const catGroup = grouped.get(product.category) ?? new Map();
    const subKey = product.subcategory ?? "__none__";
    const subGroup = catGroup.get(subKey) ?? [];
    subGroup.push(product);
    catGroup.set(subKey, subGroup);
    grouped.set(product.category, catGroup);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
        Loja
      </h1>
      <p className="mt-1.5 max-w-xl text-sm font-semibold text-muted-foreground">
        Produtos sob encomenda com procedência garantida: garanta o seu agora
        e finalize o pagamento só quando o estoque chegar — sem surpresas.
      </p>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/loja"
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-bold transition-all",
              !categoria
                ? "glow-primary border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/loja?categoria=${encodeURIComponent(cat)}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-bold transition-all",
                categoria === cat
                  ? "glow-primary border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {cat}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="mt-10 text-sm font-semibold text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-10 sm:gap-12">
          {Array.from(grouped.entries()).map(([category, subGroups]) => {
            const hasNamedSubcategories = Array.from(subGroups.keys()).some(
              (k) => k !== "__none__"
            );

            return (
              <section key={category} className="flex flex-col gap-6">
                <h2 className="font-heading text-lg font-extrabold tracking-tight sm:text-xl">
                  {category}
                </h2>

                {Array.from(subGroups.entries()).map(([subKey, items]) => (
                  <div key={subKey} className="flex flex-col gap-3">
                    {hasNamedSubcategories && (
                      <h3 className="text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
                        {subKey === "__none__" ? "Outros" : subKey}
                      </h3>
                    )}
                    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                      {items.map((product, i) => (
                        <ProductCard
                          key={product.slug}
                          product={product}
                          delay={(i % 6) * 0.05}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
