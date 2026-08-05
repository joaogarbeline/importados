import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { PaymentStatusBadge } from "@/components/admin/status-badges";
import { PaymentStatusFilter } from "@/components/admin/payment-status-filter";
import { UserSearchInput } from "@/components/admin/user-search-input";
import { PaymentActions } from "@/components/admin/payment-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentStatus } from "@/generated/prisma/enums";

export default async function AdminPagamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;

  const payments = await prisma.payment.findMany({
    where: {
      status: status ? (status as PaymentStatus) : undefined,
      order: q
        ? {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { order: { include: { user: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Pagamentos</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Todos os pagamentos gerados pela loja via Mercado Pago. Para ver os
          itens do pedido, abra o pedido correspondente.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">{payments.length} pagamento(s)</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <UserSearchInput
              defaultValue={q ?? ""}
              placeholder="Buscar por pedido, cliente ou e-mail..."
            />
            <PaymentStatusFilter defaultValue={status ?? ""} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <Link
                      href={`/admin/pedidos/${payment.orderId}`}
                      className="hover:underline"
                    >
                      #{payment.orderId.slice(-8).toUpperCase()}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    <Link
                      href={`/admin/clientes/${payment.order.userId}`}
                      className="hover:underline"
                    >
                      {payment.order.user.name}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatBRL(Number(payment.amount))}
                  </TableCell>
                  <TableCell>{payment.method ?? "-"}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(payment.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <PaymentActions
                      paymentId={payment.id}
                      status={payment.status}
                      hasMpPaymentId={Boolean(payment.mpPaymentId)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum pagamento encontrado.
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
