import Link from "next/link";
import { ArrowRightIcon, PackageIcon, CodeIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [featuredProducts, featuredServices] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="flex flex-col gap-16 pb-20">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-20 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Triade Sistemas e Importados
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Produtos importados sob encomenda e desenvolvimento de sistemas sob
            medida — de automações simples a plataformas completas.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/loja" className={cn(buttonVariants({ size: "lg" }))}>
              Ver produtos <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/servicos"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Conhecer os serviços
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="gap-2">
            <PackageIcon className="size-6 text-muted-foreground" />
            <CardTitle>Loja virtual</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              A maioria dos produtos é vendida sob encomenda: você garante seu
              pedido e só paga quando o estoque chegar — avisamos por e-mail
              assim que liberar.
            </p>
            <Link
              href="/loja"
              className="font-medium text-foreground hover:underline"
            >
              Ver catálogo →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-2">
            <CodeIcon className="size-6 text-muted-foreground" />
            <CardTitle>Serviços de programação</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              Da automação simples de tarefas até sistemas completos sob
              medida para o seu negócio.
            </p>
            <Link
              href="/servicos"
              className="font-medium text-foreground hover:underline"
            >
              Ver serviços →
            </Link>
          </CardContent>
        </Card>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">
              Produtos recentes
            </h2>
            <Link
              href="/loja"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/loja/${product.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="aspect-square w-full overflow-hidden bg-muted">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <CardContent className="flex flex-col gap-1 pt-3">
                    <span className="line-clamp-1 text-sm font-medium">
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
            ))}
          </div>
        </section>
      )}

      {featuredServices.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">Serviços</h2>
            <Link
              href="/servicos"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Ver todos
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featuredServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <p className="line-clamp-3">{service.description}</p>
                  <span className="font-medium text-foreground">
                    {service.priceType === "FIXO" && service.price
                      ? formatBRL(service.price)
                      : "Sob orçamento"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button render={<Link href="/servicos" />} variant="outline">
              Solicitar um orçamento
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
