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

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, product.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Editar produto</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>

      <ProductForm
        action={boundAction}
        submitLabel="Salvar alterações"
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price.toString(),
          sku: product.sku,
          category: product.category,
          stockQty: product.stockQty,
          isPreOrder: product.isPreOrder,
          active: product.active,
          images: product.images,
        }}
      />
    </div>
  );
}
