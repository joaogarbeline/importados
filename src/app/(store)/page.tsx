import Link from "next/link";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  BadgeCheckIcon,
  FlameIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { ProductCard } from "@/components/storefront/product-card";
import { CustomOrderDialog } from "@/components/storefront/custom-order-dialog";
import { SALES_COUNTER_BASE } from "@/lib/config";

const TRUST_ITEMS = [
  {
    icon: ShieldCheckIcon,
    title: "Pagamento 100% seguro",
    description: "Processado pelo Mercado Pago, a maior plataforma da América Latina.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Produtos originais",
    description: "Procedência garantida, sem réplicas ou produtos piratas.",
  },
  {
    icon: TruckIcon,
    title: "Só paga quando chega",
    description: "Garanta seu pedido sem risco: o pagamento só é cobrado com o estoque disponível.",
  },
];

export default async function HomePage() {
  const [featuredProducts, banners, totalOrders] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { reviews: { select: { rating: true } } },
    }),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.order.count(),
  ]);

  const salesCount = SALES_COUNTER_BASE + totalOrders;

  return (
    <div className="flex flex-col gap-16 pb-24 sm:gap-20">
      <section className="bg-grid relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[110px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-6rem] top-24 h-64 w-64 rounded-full bg-primary/10 blur-[90px]"
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:gap-10 sm:py-24">
          <Reveal className="flex flex-col items-center gap-5 text-center sm:gap-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <FlameIcon className="size-3.5" />
              Estoque por ordem de chegada — garanta o seu
            </span>
            <h1 className="max-w-3xl font-heading text-3xl font-extrabold tracking-tight sm:text-6xl">
              <span className="text-gradient-brand">Triade</span> Importados
            </h1>
            <p className="max-w-xl text-balance font-semibold text-muted-foreground sm:text-lg">
              Motos elétricas, iPhone, Apple Watch e muito mais — direto de
              fábrica, sob encomenda, com pagamento 100% seguro e sem risco.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/loja"
                className={cn(buttonVariants({ size: "lg" }), "glow-primary")}
              >
                Ver produtos <ArrowRightIcon className="size-4" />
              </Link>
              <CustomOrderDialog
                triggerLabel="Fazer uma encomenda"
                variant="outline"
              />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              <span className="font-extrabold text-foreground">
                +<AnimatedCounter value={salesCount} className="tabular-nums" />
              </span>{" "}
              pedidos realizados com sucesso
            </p>
          </Reveal>

          {banners.length > 0 && (
            <Reveal delay={0.15}>
              <HeroCarousel banners={banners} />
            </Reveal>
          )}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 sm:grid-cols-3 sm:gap-6">
        {TRUST_ITEMS.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08}>
            <Card className="neon-border-hover h-full bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="flex flex-col gap-2 p-5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <item.icon className="size-4.5" />
                </div>
                <p className="font-extrabold">{item.title}</p>
                <p className="text-sm font-semibold text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <Reveal className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-extrabold sm:text-2xl">
              Mais procurados
            </h2>
            <Link
              href="/loja"
              className="text-sm font-bold text-muted-foreground hover:text-primary"
            >
              Ver todos
            </Link>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.slug} product={product} delay={i * 0.06} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-6xl px-4">
        <Reveal>
          <div className="neon-border relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground via-foreground to-primary/40 px-6 py-12 text-center text-background sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid opacity-10"
            />
            <div className="relative flex flex-col items-center gap-4">
              <h2 className="max-w-xl font-heading text-2xl font-extrabold sm:text-3xl">
                Não achou o que procura? Não se preocupe!
              </h2>
              <p className="max-w-lg text-sm font-semibold text-background/80 sm:text-base">
                Conte pra gente o produto que você quer e a gente cuida de
                trazer sob encomenda — rápido, seguro e sem complicação.
              </p>
              <CustomOrderDialog
                triggerLabel="Faça sua encomenda"
                variant="secondary"
                className="mt-2"
              />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
