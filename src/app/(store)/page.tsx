import Link from "next/link";
import { ArrowRightIcon, PackageIcon, CodeIcon, SparklesIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

export default async function HomePage() {
  const [featuredProducts, featuredServices, banners] = await Promise.all([
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
    prisma.banner.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-20 pb-24">
      <section className="bg-grid relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-6rem] top-24 h-64 w-64 rounded-full bg-primary/10 blur-[90px]"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:py-24">
          <Reveal className="flex flex-col items-center gap-6 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <SparklesIcon className="size-3.5" />
              Loja virtual & desenvolvimento de sistemas
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              <span className="text-gradient-brand">Triade</span> Sistemas e
              Importados
            </h1>
            <p className="max-w-xl text-balance text-muted-foreground sm:text-lg">
              Produtos importados sob encomenda e desenvolvimento de sistemas
              sob medida — de automações simples a plataformas completas.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/loja"
                className={cn(buttonVariants({ size: "lg" }), "glow-primary")}
              >
                Ver produtos <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href="/servicos"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                Conhecer os serviços
              </Link>
            </div>
          </Reveal>

          {banners.length > 0 && (
            <Reveal delay={0.15}>
              <HeroCarousel banners={banners} />
            </Reveal>
          )}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:grid-cols-2">
        <Reveal>
          <Card className="h-full border-primary/15 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <PackageIcon className="size-5" />
              </div>
              <CardTitle>Loja virtual</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>
                A maioria dos produtos é vendida sob encomenda: você garante
                seu pedido e só paga quando o estoque chegar — avisamos por
                e-mail assim que liberar.
              </p>
              <Link
                href="/loja"
                className="font-medium text-primary hover:underline"
              >
                Ver catálogo →
              </Link>
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="h-full border-primary/15 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CodeIcon className="size-5" />
              </div>
              <CardTitle>Serviços de programação</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>
                Da automação simples de tarefas até sistemas completos sob
                medida para o seu negócio.
              </p>
              <Link
                href="/servicos"
                className="font-medium text-primary hover:underline"
              >
                Ver serviços →
              </Link>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <Reveal className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold sm:text-2xl">
              Produtos recentes
            </h2>
            <Link
              href="/loja"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Ver todos
            </Link>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.06}>
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
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {featuredServices.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <Reveal className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold sm:text-2xl">
              Serviços
            </h2>
            <Link
              href="/servicos"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Ver todos
            </Link>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {featuredServices.map((service, i) => (
              <Reveal key={service.id} delay={i * 0.08}>
                <TiltCard>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {service.name}
                      </CardTitle>
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
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-foreground via-foreground to-primary/40 px-6 py-14 text-center text-background sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid opacity-10"
            />
            <div className="relative flex flex-col items-center gap-4">
              <h2 className="max-w-xl text-2xl font-semibold sm:text-3xl">
                Tem um projeto em mente?
              </h2>
              <p className="max-w-lg text-sm text-background/80 sm:text-base">
                Da automação simples até sistemas completos — conte pra gente
                o que você precisa e montamos uma proposta sob medida.
              </p>
              <Link
                href="/servicos"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "mt-2"
                )}
              >
                Solicitar orçamento
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
