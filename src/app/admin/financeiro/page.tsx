import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { StatCard } from "@/components/admin/stat-card";
import { PaymentStatusBadge } from "@/components/admin/status-badges";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { ExpenseForm } from "@/components/admin/expense-form";
import { deleteExpenseAction } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrashIcon, ReceiptTextIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

const DAYS = 30;

function growth(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export default async function AdminFinanceiroPage() {
  const now = new Date();
  const since = new Date();
  since.setDate(since.getDate() - DAYS);
  since.setHours(0, 0, 0, 0);

  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    approvedPayments,
    pendingAgg,
    refundedOrRejectedAgg,
    recentPayments,
    monthRevenueAgg,
    prevMonthRevenueAgg,
    monthCogsItems,
    prevMonthCogsItems,
    monthExpenses,
    prevMonthExpenses,
    expenses,
  ] = await Promise.all([
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
    prisma.order.aggregate({ where: { paidAt: { gte: monthStart } }, _sum: { total: true } }),
    prisma.order.aggregate({
      where: { paidAt: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { total: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { paidAt: { gte: monthStart } } },
      select: { qty: true, unitPrice: true, product: { select: { costPrice: true } } },
    }),
    prisma.orderItem.findMany({
      where: { order: { paidAt: { gte: prevMonthStart, lte: prevMonthEnd } } },
      select: { qty: true, unitPrice: true, product: { select: { costPrice: true } } },
    }),
    prisma.expense.aggregate({ where: { date: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.expense.aggregate({
      where: { date: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
    }),
    prisma.expense.findMany({ orderBy: { date: "desc" }, take: 20 }),
  ]);

  const totalApproved = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const byDay = new Map<string, number>();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), 0);
  }
  for (const payment of approvedPayments) {
    const key = payment.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    byDay.set(key, (byDay.get(key) ?? 0) + Number(payment.amount));
  }
  const chartData = Array.from(byDay.entries()).map(([date, total]) => ({ date, total }));

  function cogs(items: typeof monthCogsItems) {
    return items.reduce((sum, i) => sum + (i.product.costPrice ? Number(i.product.costPrice) : 0) * i.qty, 0);
  }

  const monthRevenue = Number(monthRevenueAgg._sum.total ?? 0);
  const prevMonthRevenue = Number(prevMonthRevenueAgg._sum.total ?? 0);
  const monthExpensesTotal = Number(monthExpenses._sum.amount ?? 0);
  const prevMonthExpensesTotal = Number(prevMonthExpenses._sum.amount ?? 0);
  const monthProfit = monthRevenue - cogs(monthCogsItems) - monthExpensesTotal;
  const prevMonthProfit = prevMonthRevenue - cogs(prevMonthCogsItems) - prevMonthExpensesTotal;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Financeiro</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Fluxo de caixa, lucro real e despesas do negócio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Receita no mês"
          value={formatBRL(monthRevenue)}
          icon={WalletIcon}
          trend={growth(monthRevenue, prevMonthRevenue)}
          hint="vs. mês anterior"
        />
        <StatCard
          label="Despesas no mês"
          value={formatBRL(monthExpensesTotal)}
          icon={ReceiptTextIcon}
          tone={monthExpensesTotal > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Lucro real no mês"
          value={formatBRL(monthProfit)}
          icon={TrendingUpIcon}
          tone={monthProfit >= 0 ? "success" : "critical"}
          trend={growth(monthProfit, prevMonthProfit)}
          hint="receita − custo dos produtos − despesas"
        />
        <StatCard
          label={`Recebido (últimos ${DAYS} dias)`}
          value={formatBRL(totalApproved)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lançar despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="max-w-[160px] truncate font-bold">
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatBRL(Number(expense.amount))}</TableCell>
                    <TableCell className="text-right">
                      <form action={deleteExpenseAction.bind(null, expense.id)}>
                        <Button type="submit" variant="ghost" size="icon-sm" aria-label="Excluir despesa">
                          <TrashIcon className="size-3.5" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma despesa lançada ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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
