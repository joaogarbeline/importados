import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/app/admin/produtos/actions";

export default function NovoProdutoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Novo produto</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um novo produto no catálogo da loja.
        </p>
      </div>

      <ProductForm action={createProductAction} submitLabel="Criar produto" />
    </div>
  );
}
