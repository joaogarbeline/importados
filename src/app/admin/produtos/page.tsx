import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductFilters } from "@/components/admin/product-filters";
import { cn } from "@/lib/utils";
import { toggleProductActiveAction } from "./actions";
import { PackageIcon } from "lucide-react";

const PAGE_SIZE = 20;
const LOW_STOCK_THRESHOLD = 5;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    busca?: string;
    categoria?: string;
    status?: string;
    sort?: string;
    view?: string;
    page?: string;
  }>;
}) {
  const { busca = "", categoria = "", status = "", sort = "recentes", view = "tabela", page = "1" } =
    await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(busca
      ? {
          OR: [
            { name: { contains: busca, mode: "insensitive" } },
            { sku: { contains: busca, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categoria ? { category: categoria } : {}),
    ...(status === "ativo" ? { active: true } : {}),
    ...(status === "inativo" ? { active: false } : {}),
    ...(status === "baixo" ? { stockQty: { gt: 0, lte: LOW_STOCK_THRESHOLD } } : {}),
    ...(status === "esgotado" ? { stockQty: { lte: 0 } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "nome"
      ? { name: "asc" }
      : sort === "preco-desc"
        ? { price: "desc" }
        : sort === "preco-asc"
          ? { price: "asc" }
          : sort === "estoque"
            ? { stockQty: "asc" }
            : { createdAt: "desc" };

  const [products, total, categoryRows] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ]);

  const categories = categoryRows.map((c) => c.category);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (categoria) params.set("categoria", categoria);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    if (view) params.set("view", view);
    params.set("page", String(p));
    return `/admin/produtos?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">Produtos</h1>
          <p className="text-sm font-semibold text-muted-foreground">
            Gerencie o catálogo da loja.
          </p>
        </div>
        <Link href="/admin/produtos/novo" className={cn(buttonVariants())}>
          Novo produto
        </Link>
      </div>

      <Card>
        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">{total} produto(s)</CardTitle>
          <ProductFilters categories={categories} defaults={{ busca, categoria, status, sort, view }} />
        </CardHeader>
        <CardContent>
          {view === "grade" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => {
                const margin =
                  product.costPrice != null
                    ? Number(product.price) - Number(product.costPrice)
                    : null;
                return (
                  <Link
                    key={product.id}
                    href={`/admin/produtos/${product.id}`}
                    className="card-lift group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <PackageIcon className="size-8" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {product.active ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 p-3">
                      <span className="line-clamp-1 text-sm font-extrabold">{product.name}</span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {product.brand ?? product.category}
                      </span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-extrabold tabular-nums">
                          {formatBRL(product.price)}
                        </span>
                        <span className="text-xs font-bold tabular-nums text-muted-foreground">
                          Estq. {product.stockQty}
                        </span>
                      </div>
                      {margin != null && (
                        <span
                          className={cn(
                            "text-xs font-bold tabular-nums",
                            margin >= 0 ? "text-success" : "text-destructive"
                          )}
                        >
                          Lucro {formatBRL(margin)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
              {products.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm font-semibold text-muted-foreground">
                  Nenhum produto encontrado.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Lucro</TableHead>
                  <TableHead>Qtd.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const toggleAction = toggleProductActiveAction.bind(
                    null,
                    product.id,
                    !product.active
                  );
                  const margin =
                    product.costPrice != null
                      ? Number(product.price) - Number(product.costPrice)
                      : null;
                  const lowStock =
                    product.stockQty > 0 && product.stockQty <= LOW_STOCK_THRESHOLD;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                              <PackageIcon className="size-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate font-bold">
                        <Link href={`/admin/produtos/${product.id}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.brand ?? "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{product.category}</span>
                          {product.subcategory && (
                            <span className="text-xs font-semibold text-muted-foreground">
                              {product.subcategory}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{formatBRL(product.price)}</TableCell>
                      <TableCell
                        className={cn(
                          "tabular-nums font-bold",
                          margin == null
                            ? "text-muted-foreground"
                            : margin >= 0
                              ? "text-success"
                              : "text-destructive"
                        )}
                      >
                        {margin != null ? formatBRL(margin) : "-"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        <span className={cn(lowStock && "font-bold text-warning")}>
                          {product.stockQty}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.active ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <form action={toggleAction}>
                          <Button type="submit" variant="ghost" size="sm">
                            {product.active ? "Desativar" : "Ativar"}
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={pageHref(Math.max(1, currentPage - 1))}
                  aria-disabled={currentPage === 1}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                >
                  Anterior
                </Link>
                <Link
                  href={pageHref(Math.min(totalPages, currentPage + 1))}
                  aria-disabled={currentPage === totalPages}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    currentPage === totalPages && "pointer-events-none opacity-50"
                  )}
                >
                  Próxima
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
