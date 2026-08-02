import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { formatBRL } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_BADGE_VARIANT,
  CANCELABLE_STATUSES,
} from "@/components/storefront/order-status";
import { cancelMyOrderAction } from "./actions";

export default async function PedidoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ novo?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { novo } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      payments: { orderBy: { createdAt: "desc" } },
      shippingAddress: true,
    },
  });

  if (!order || order.userId !== user.id) {
    notFound();
  }

  const pendingPayment = order.payments.find(
    (p) => p.status === "PENDENTE" && p.initPoint
  );
  const canCancel = CANCELABLE_STATUSES.includes(order.status);
  const boundCancel = cancelMyOrderAction.bind(null, order.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link
        href="/minha-conta"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Voltar para meus pedidos
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">
          Pedido #{order.id.slice(-8).toUpperCase()}
        </h1>
        <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Badge>
      </div>

      {novo === "1" && (
        <Alert className="mt-4">
          <AlertDescription>
            Pedido realizado com sucesso! Acompanhe o status por aqui.
          </AlertDescription>
        </Alert>
      )}

      {pendingPayment?.initPoint && (
        <Alert className="mt-4">
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>Seu pagamento está liberado. Finalize para garantir o pedido.</span>
            <Button
              size="sm"
              render={
                <a
                  href={pendingPayment.initPoint}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Pagar agora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mt-6 flex flex-col gap-3 p-5">
        <h2 className="font-heading font-semibold">Itens</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.qty}x {item.product.name}
              {!item.stockAllocated && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (aguardando estoque)
                </span>
              )}
            </span>
            <span>{formatBRL(Number(item.unitPrice) * item.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>{formatBRL(order.total)}</span>
        </div>
      </Card>

      {order.shippingAddress && (
        <Card className="mt-4 flex flex-col gap-1 p-5">
          <h2 className="font-heading font-semibold">Endereço de entrega</h2>
          <p className="text-sm text-muted-foreground">
            {order.shippingAddress.rua}, {order.shippingAddress.numero}
            {order.shippingAddress.complemento
              ? ` - ${order.shippingAddress.complemento}`
              : ""}
            <br />
            {order.shippingAddress.bairro} - {order.shippingAddress.cidade}/
            {order.shippingAddress.uf}
            <br />
            CEP {order.shippingAddress.cep}
          </p>
        </Card>
      )}

      {canCancel && (
        <form action={boundCancel} className="mt-6">
          <Button type="submit" variant="destructive">
            Cancelar pedido
          </Button>
        </form>
      )}
    </div>
  );
}
