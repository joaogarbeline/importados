import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/app/admin/produtos/actions";

export default async function NovoProdutoPage() {
  const [categoryRows, subcategoryRows] = await Promise.all([
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    prisma.product.findMany({
      where: { subcategory: { not: null } },
      distinct: ["subcategory"],
      select: { subcategory: true },
      orderBy: { subcategory: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          Novo produto
        </h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Cadastre um novo produto no catálogo da loja.
        </p>
      </div>

      <ProductForm
        action={createProductAction}
        submitLabel="Criar produto"
        categoryOptions={categoryRows.map((c) => c.category)}
        subcategoryOptions={subcategoryRows
          .map((s) => s.subcategory)
          .filter((s): s is string => Boolean(s))}
      />
    </div>
  );
}
