import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { StatCard } from "@/components/admin/stat-card";
import { PaymentStatusBadge } from "@/components/admin/status-badges";
import { RevenueChart } from "@/components/admin/revenue-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = 30;

export default async function AdminFinanceiroPage() {
  const since = new Date();
  since.setDate(since.getDate() - DAYS);
  since.setHours(0, 0, 0, 0);

  const [approvedPayments, pendingAgg, refundedOrRejectedAgg, recentPayments] =
    await Promise.all([
      prisma.payment.findMany({
        where: { status: "APROVADO", createdAt: { gte: since } },
        select: { amount: true, createdAt: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PENDENTE" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: { in: ["RECUSADO", "CANCELADO", "ESTORNADO"] } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        include: { order: { include: { user: true } } },
      }),
    ]);

  const totalApproved = approvedPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const byDay = new Map<string, number>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), 0);
  }
  for (const payment of approvedPayments) {
    const key = payment.createdAt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    byDay.set(key, (byDay.get(key) ?? 0) + Number(payment.amount));
  }
  const chartData = Array.from(byDay.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Financeiro</h1>
        <p className="text-sm text-muted-foreground">
          Pagamentos recebidos e pendentes via Mercado Pago.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={`Recebido (últimos ${DAYS} dias)`}
          value={formatBRL(totalApproved)}
        />
        <StatCard
          label="Pendente de pagamento"
          value={formatBRL(Number(pendingAgg._sum.amount ?? 0))}
          hint={`${pendingAgg._count} pagamento(s)`}
          tone={pendingAgg._count > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Recusado / cancelado / estornado"
          value={formatBRL(Number(refundedOrRejectedAgg._sum.amount ?? 0))}
          hint={`${refundedOrRejectedAgg._count} pagamento(s)`}
          tone={refundedOrRejectedAgg._count > 0 ? "critical" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Faturamento por dia (últimos {DAYS} dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagamentos recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.order.user.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    #{payment.order.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatBRL(Number(payment.amount))}
                  </TableCell>
                  <TableCell>{payment.method ?? "-"}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(payment.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {recentPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum pagamento ainda.
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
