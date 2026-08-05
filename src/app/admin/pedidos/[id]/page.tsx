import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  orderStatusLabel,
} from "@/components/admin/status-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "@/components/admin/print-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/enums";
import {
  resendLinkAction,
  cancelOrderAction,
  markPreparingAction,
  markShippedAction,
  markDeliveredAction,
} from "@/app/admin/pedidos/actions";

const PIPELINE: OrderStatus[] = [
  "AGUARDANDO_ESTOQUE",
  "LIBERADO_PARA_PAGAMENTO",
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "EM_PREPARACAO",
  "ENVIADO",
  "ENTREGUE",
];

function OrderTimeline({ status }: { status: OrderStatus }) {
  const isTerminalBad = status === "CANCELADO" || status === "PAGAMENTO_EXPIRADO";
  const currentIndex = PIPELINE.indexOf(status);

  return (
    <div className="flex flex-col">
      {PIPELINE.map((step, i) => {
        const done = !isTerminalBad && i <= currentIndex;
        const isCurrent = !isTerminalBad && i === currentIndex;
        const isLast = i === PIPELINE.length - 1;
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-extrabold",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {done ? <CheckIcon className="size-3.5" /> : i + 1}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "min-h-6 w-0.5 flex-1",
                    i < currentIndex && !isTerminalBad ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm",
                  isCurrent
                    ? "font-extrabold text-foreground"
                    : done
                      ? "font-bold text-foreground"
                      : "font-semibold text-muted-foreground"
                )}
              >
                {orderStatusLabel(step)}
              </p>
            </div>
          </div>
        );
      })}

      {isTerminalBad && (
        <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-bold text-destructive">
          {status === "CANCELADO" ? "Pedido cancelado" : "Pagamento expirado"}
        </div>
      )}
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      shippingAddress: true,
      items: { include: { product: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const canCancel = !["CANCELADO", "ENTREGUE"].includes(order.status);
  const canResendLink = ["LIBERADO_PARA_PAGAMENTO", "AGUARDANDO_PAGAMENTO"].includes(
    order.status
  );
  const canMarkPreparing = order.status === "PAGO";
  const canMarkShipped = order.status === "EM_PREPARACAO";
  const canMarkDelivered = order.status === "ENVIADO";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">
            Pedido #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">
            Criado em{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PrintButton />
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Itens do pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd.</TableHead>
                  <TableHead>Preço unit.</TableHead>
                  <TableHead>Estoque reservado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/admin/produtos/${item.productId}`}
                        className="hover:underline"
                      >
                        {item.product.name}
                      </Link>
                    </TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatBRL(Number(item.unitPrice))}
                    </TableCell>
                    <TableCell>
                      {item.stockAllocated ? (
                        <Badge variant="success">Sim</Badge>
                      ) : (
                        <Badge variant="outline">Aguardando</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-4" />
            <div className="flex justify-end text-sm">
              <div className="w-48 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{formatBRL(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between font-extrabold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatBRL(Number(order.total))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status do pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-bold">
                <Link href={`/admin/clientes/${order.userId}`} className="hover:underline">
                  {order.user.name}
                </Link>
              </p>
              <p className="text-muted-foreground">{order.user.email}</p>
              {order.user.phone && (
                <p className="text-muted-foreground">{order.user.phone}</p>
              )}
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Endereço de entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5 text-sm text-muted-foreground">
                <p>
                  {order.shippingAddress.rua}, {order.shippingAddress.numero}
                  {order.shippingAddress.complemento
                    ? ` - ${order.shippingAddress.complemento}`
                    : ""}
                </p>
                <p>{order.shippingAddress.bairro}</p>
                <p>
                  {order.shippingAddress.cidade}/{order.shippingAddress.uf} —{" "}
                  {order.shippingAddress.cep}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="no-print">
            <CardHeader>
              <CardTitle className="text-base">Ações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {canResendLink && (
                <form action={resendLinkAction.bind(null, order.id)}>
                  <Button type="submit" className="w-full" variant="secondary">
                    Reenviar link de pagamento
                  </Button>
                </form>
              )}
              {canMarkPreparing && (
                <form action={markPreparingAction.bind(null, order.id)}>
                  <Button type="submit" className="w-full" variant="secondary">
                    Marcar como em preparação
                  </Button>
                </form>
              )}
              {canMarkShipped && (
                <form action={markShippedAction.bind(null, order.id)}>
                  <Button type="submit" className="w-full" variant="secondary">
                    Marcar como enviado
                  </Button>
                </form>
              )}
              {canMarkDelivered && (
                <form action={markDeliveredAction.bind(null, order.id)}>
                  <Button type="submit" className="w-full" variant="secondary">
                    Marcar como entregue
                  </Button>
                </form>
              )}
              {canCancel && (
                <form action={cancelOrderAction.bind(null, order.id)}>
                  <Button type="submit" className="w-full" variant="destructive">
                    Cancelar pedido
                  </Button>
                </form>
              )}
              {!canCancel && !canResendLink && !canMarkPreparing && !canMarkShipped && !canMarkDelivered && (
                <p className="text-sm font-semibold text-muted-foreground">
                  Nenhuma ação disponível para este status.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="no-print">
        <CardHeader>
          <CardTitle className="text-base">Histórico de pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Preference / ID</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatBRL(Number(payment.amount))}
                  </TableCell>
                  <TableCell>{payment.method ?? "-"}</TableCell>
                  <TableCell className="max-w-[220px] truncate font-mono text-xs">
                    {payment.mpPaymentId ?? payment.mpPreferenceId ?? "-"}
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(payment.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {order.payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum pagamento gerado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
