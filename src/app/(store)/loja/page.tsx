import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/storefront/product-card";
import { ShopFilters } from "@/components/storefront/shop-filters";

export const metadata = { title: "Loja — Triade Importados" };

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    subcategoria?: string;
    marca?: string;
    disponibilidade?: string;
    precoMin?: string;
    precoMax?: string;
    ordenar?: string;
    q?: string;
  }>;
}) {
  const {
    categoria = "",
    subcategoria = "",
    marca = "",
    disponibilidade = "",
    precoMin = "",
    precoMax = "",
    ordenar = "recentes",
    q = "",
  } = await searchParams;

  const min = precoMin ? Number(precoMin) : undefined;
  const max = precoMax ? Number(precoMax) : undefined;

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(categoria ? { category: categoria } : {}),
    ...(subcategoria ? { subcategory: subcategoria } : {}),
    ...(marca ? { brand: marca } : {}),
    ...(disponibilidade === "estoque" ? { isPreOrder: false, stockQty: { gt: 0 } } : {}),
    ...(disponibilidade === "encomenda" ? { isPreOrder: true } : {}),
    ...(min !== undefined || max !== undefined
      ? {
          price: {
            ...(min !== undefined && !Number.isNaN(min) ? { gte: min } : {}),
            ...(max !== undefined && !Number.isNaN(max) ? { lte: max } : {}),
          },
        }
      : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  // "Navegação" (só categoria, ou nada) agrupa por categoria/subcategoria.
  // Qualquer outro filtro ativo vira busca — grade única, ordenada.
  const hasActiveFilters = Boolean(
    subcategoria || marca || disponibilidade || precoMin || precoMax || q || ordenar !== "recentes"
  );

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    ordenar === "menor-preco"
      ? [{ price: "asc" }]
      : ordenar === "maior-preco"
        ? [{ price: "desc" }]
        : ordenar === "nome"
          ? [{ name: "asc" }]
          : hasActiveFilters
            ? [{ createdAt: "desc" }]
            : [{ category: "asc" }, { subcategory: "asc" }, { createdAt: "desc" }];

  const [products, categoryRows, subcategoryRows, brandRows] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { reviews: { select: { rating: true } } },
    }),
    prisma.product.findMany({
      where: { active: true },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    prisma.product.findMany({
      where: {
        active: true,
        subcategory: { not: null },
        ...(categoria ? { category: categoria } : {}),
      },
      distinct: ["subcategory"],
      select: { subcategory: true },
      orderBy: { subcategory: "asc" },
    }),
    prisma.product.findMany({
      where: {
        active: true,
        brand: { not: null },
        ...(categoria ? { category: categoria } : {}),
      },
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
  ]);

  const categories = categoryRows.map((c) => c.category);
  const subcategories = subcategoryRows
    .map((s) => s.subcategory)
    .filter((s): s is string => Boolean(s));
  const brands = brandRows.map((b) => b.brand).filter((b): b is string => Boolean(b));

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

      <ShopFilters
        categories={categories}
        subcategories={subcategories}
        brands={brands}
        defaults={{ q, categoria, subcategoria, marca, disponibilidade, precoMin, precoMax, ordenar }}
        hasActiveFilters={hasActiveFilters}
      />

      {products.length === 0 ? (
        <p className="mt-10 text-sm font-semibold text-muted-foreground">
          Nenhum produto encontrado com esses filtros.
        </p>
      ) : hasActiveFilters ? (
        <>
          <p className="mt-6 text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
            {products.length} produto{products.length === 1 ? "" : "s"} encontrado
            {products.length === 1 ? "" : "s"}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {products.map((product, i) => (
              <ProductCard key={product.slug} product={product} delay={(i % 6) * 0.05} />
            ))}
          </div>
        </>
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
