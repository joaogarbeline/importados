import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceRequestDialog } from "@/components/storefront/service-request-dialog";

const COMPLEXITY_LABEL: Record<string, string> = {
  SIMPLES: "Simples",
  MEDIA: "Média",
  COMPLEXA: "Complexa",
};

export default async function ServicosPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: [{ complexity: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold">
          Serviços de programação
        </h1>
        <p className="text-muted-foreground">
          De automações simples a sistemas completos — conte o que você
          precisa e montamos uma proposta sob medida.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            Nenhum serviço publicado no momento.
          </p>
          <ServiceRequestDialog />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-heading font-semibold">{service.name}</h2>
                <Badge variant="outline">
                  {COMPLEXITY_LABEL[service.complexity] ?? service.complexity}
                </Badge>
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {service.category}
              </p>
              <p className="line-clamp-4 text-sm text-muted-foreground">
                {service.description}
              </p>
              <div className="mt-auto flex flex-col gap-3">
                <p className="font-semibold">
                  {service.priceType === "FIXO" && service.price
                    ? formatBRL(service.price)
                    : "Sob orçamento"}
                </p>
                <ServiceRequestDialog
                  serviceId={service.id}
                  serviceName={service.name}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center">
        <h2 className="font-heading text-lg font-semibold">
          Não encontrou o que precisa?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fale com a gente e descreva seu projeto — atendemos desde uma
          automação simples até sistemas complexos sob medida.
        </p>
        <div className="mt-4 flex justify-center">
          <ServiceRequestDialog />
        </div>
      </div>
    </div>
  );
}
