import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { updateProductAction } from "@/app/admin/produtos/actions";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categoryRows, subcategoryRows] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
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
  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, product.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          Editar produto
        </h1>
        <p className="text-sm font-semibold text-muted-foreground">{product.name}</p>
      </div>

      <ProductForm
        action={boundAction}
        submitLabel="Salvar alterações"
        categoryOptions={categoryRows.map((c) => c.category)}
        subcategoryOptions={subcategoryRows
          .map((s) => s.subcategory)
          .filter((s): s is string => Boolean(s))}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price.toString(),
          costPrice: product.costPrice ? product.costPrice.toString() : "",
          sku: product.sku,
          barcode: product.barcode,
          category: product.category,
          subcategory: product.subcategory,
          stockQty: product.stockQty,
          isPreOrder: product.isPreOrder,
          active: product.active,
          images: product.images,
          brand: product.brand,
          model: product.model,
          color: product.color,
          capacity: product.capacity,
          warranty: product.warranty,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
        }}
      />
    </div>
  );
}
