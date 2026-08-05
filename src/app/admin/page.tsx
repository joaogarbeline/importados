import Link from "next/link";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/components/admin/status-badges";
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
import { Badge } from "@/components/ui/badge";
import {
  WalletIcon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  TruckIcon,
  BoxesIcon,
  AlertTriangleIcon,
  PackageXIcon,
  TrendingUpIcon,
  FlameIcon,
} from "lucide-react";

const LOW_STOCK_THRESHOLD = 5;
const IN_PROGRESS_STATUSES = [
  "AGUARDANDO_ESTOQUE",
  "LIBERADO_PARA_PAGAMENTO",
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "EM_PREPARACAO",
] as const;

function growth(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export default async function AdminOverviewPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));
  const chartStart = subDays(todayStart, 13);

  const [
    revenueToday,
    revenueWeek,
    revenueMonth,
    revenuePrevMonth,
    ordersInProgress,
    ordersShipped,
    inStockCount,
    lowStockProducts,
    lowStockCount,
    outOfStockCount,
    bestSellersRaw,
    profitTodayItems,
    profitMonthItems,
    salesForChart,
    recentSales,
    recentCustomers,
    recentProducts,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { paidAt: { gte: todayStart } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { paidAt: { gte: weekStart } }, _sum: { total: true } }),
    prisma.order.aggregate({
      where: { paidAt: { gte: monthStart } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { paidAt: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: { in: [...IN_PROGRESS_STATUSES] } } }),
    prisma.order.count({ where: { status: "ENVIADO" } }),
    prisma.product.count({ where: { active: true, stockQty: { gt: 0 } } }),
    prisma.product.findMany({
      where: { active: true, stockQty: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stockQty: "asc" },
      take: 6,
    }),
    prisma.product.count({
      where: { active: true, stockQty: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
    }),
    prisma.product.count({ where: { active: true, stockQty: { lte: 0 } } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
    }),
    prisma.orderItem.findMany({
      where: { order: { paidAt: { gte: todayStart } } },
      select: { qty: true, unitPrice: true, product: { select: { costPrice: true } } },
    }),
    prisma.orderItem.findMany({
      where: { order: { paidAt: { gte: monthStart } } },
      select: { qty: true, unitPrice: true, product: { select: { costPrice: true } } },
    }),
    prisma.order.findMany({
      where: { paidAt: { gte: chartStart } },
      select: { total: true, paidAt: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: true, items: true },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const bestSellerProducts = await prisma.product.findMany({
    where: { id: { in: bestSellersRaw.map((b) => b.productId) } },
    select: { id: true, name: true, images: true },
  });
  const bestSellers = bestSellersRaw
    .map((b) => ({
      product: bestSellerProducts.find((p) => p.id === b.productId),
      qty: b._sum.qty ?? 0,
    }))
    .filter((b) => b.product);

  function calcProfit(items: typeof profitTodayItems) {
    return items.reduce((sum, item) => {
      const cost = item.product.costPrice ? Number(item.product.costPrice) : 0;
      return sum + (Number(item.unitPrice) - cost) * item.qty;
    }, 0);
  }

  const profitToday = calcProfit(profitTodayItems);
  const profitMonth = calcProfit(profitMonthItems);

  const byDay = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = subDays(now, 13 - i);
    byDay.set(d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), 0);
  }
  for (const order of salesForChart) {
    if (!order.paidAt) continue;
    const key = order.paidAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    byDay.set(key, (byDay.get(key) ?? 0) + Number(order.total));
  }
  const chartData = Array.from(byDay.entries()).map(([date, total]) => ({ date, total }));

  const monthRevenue = Number(revenueMonth._sum.total ?? 0);
  const prevMonthRevenue = Number(revenuePrevMonth._sum.total ?? 0);
  const avgTicket = revenueMonth._count > 0 ? monthRevenue / revenueMonth._count : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
          Visão geral
        </h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Resumo da operação da Triade Sistemas e Importados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Receita hoje"
          value={formatBRL(Number(revenueToday._sum.total ?? 0))}
          icon={CalendarDaysIcon}
        />
        <StatCard
          label="Receita na semana"
          value={formatBRL(Number(revenueWeek._sum.total ?? 0))}
          icon={CalendarRangeIcon}
        />
        <StatCard
          label="Receita no mês"
          value={formatBRL(monthRevenue)}
          icon={WalletIcon}
          trend={growth(monthRevenue, prevMonthRevenue)}
          hint="vs. mês anterior"
        />
        <StatCard
          label="Ticket médio"
          value={formatBRL(avgTicket)}
          icon={ReceiptIcon}
          hint={`${revenueMonth._count} pedido(s) pagos no mês`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Lucro hoje"
          value={formatBRL(profitToday)}
          icon={TrendingUpIcon}
          tone="success"
        />
        <StatCard
          label="Lucro no mês"
          value={formatBRL(profitMonth)}
          icon={TrendingUpIcon}
          tone="success"
          hint="estimado com o custo atual dos produtos"
        />
        <StatCard
          label="Pedidos em andamento"
          value={String(ordersInProgress)}
          icon={ShoppingCartIcon}
          tone={ordersInProgress > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Pedidos enviados"
          value={String(ordersShipped)}
          icon={TruckIcon}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Produtos em estoque"
          value={String(inStockCount)}
          icon={BoxesIcon}
        />
        <StatCard
          label="Estoque baixo"
          value={String(lowStockCount)}
          icon={AlertTriangleIcon}
          tone={lowStockCount > 0 ? "warning" : "default"}
          hint={`Limite: ${LOW_STOCK_THRESHOLD} unidades`}
        />
        <StatCard
          label="Produtos esgotados"
          value={String(outOfStockCount)}
          icon={PackageXIcon}
          tone={outOfStockCount > 0 ? "critical" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução das vendas (14 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlameIcon className="size-4 text-warning" />
              Produtos mais vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Unidades vendidas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestSellers.map(({ product, qty }) => (
                  <TableRow key={product!.id}>
                    <TableCell className="max-w-[220px] truncate">
                      <Link href={`/admin/produtos/${product!.id}`} className="hover:underline">
                        {product!.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{qty}</TableCell>
                  </TableRow>
                ))}
                {bestSellers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhuma venda registrada ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estoque baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Sob encomenda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="max-w-[160px] truncate">
                      <Link href={`/admin/produtos/${product.id}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums">{product.stockQty}</TableCell>
                    <TableCell>
                      {product.isPreOrder ? (
                        <Badge variant="secondary">Sim</Badge>
                      ) : (
                        <Badge variant="outline">Não</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {lowStockProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum produto com estoque baixo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Últimas vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="max-w-[140px] truncate">
                      <Link href={`/admin/pedidos/${order.id}`} className="hover:underline">
                        {order.user.name}
                      </Link>
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell className="tabular-nums">{formatBRL(Number(order.total))}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {recentSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum pedido ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Últimos clientes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {recentCustomers.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/clientes/${c.id}`}
                  className="flex items-center justify-between gap-2 text-sm hover:underline"
                >
                  <span className="truncate font-bold">{c.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR").format(c.createdAt)}
                  </span>
                </Link>
              ))}
              {recentCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum cliente ainda.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Produtos recém cadastrados</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {recentProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/produtos/${p.id}`}
                  className="flex items-center justify-between gap-2 text-sm hover:underline"
                >
                  <span className="truncate font-bold">{p.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {formatBRL(p.price)}
                  </span>
                </Link>
              ))}
              {recentProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum produto ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
