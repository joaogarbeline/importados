import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/components/admin/status-badges";
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

const LOW_STOCK_THRESHOLD = 5;

export default async function AdminOverviewPage() {
  const [
    revenueAgg,
    aguardandoEstoque,
    aguardandoPagamento,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paidAt: { not: null } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "AGUARDANDO_ESTOQUE" } }),
    prisma.order.count({
      where: { status: { in: ["LIBERADO_PARA_PAGAMENTO", "AGUARDANDO_PAGAMENTO"] } },
    }),
    prisma.product.findMany({
      where: { active: true, stockQty: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stockQty: "asc" },
      take: 6,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: true, items: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Visão geral</h1>
        <p className="text-sm text-muted-foreground">
          Resumo da operação da Triade Sistemas e Importados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faturamento total (pago)"
          value={formatBRL(Number(revenueAgg._sum.total ?? 0))}
        />
        <StatCard
          label="Pedidos aguardando estoque"
          value={String(aguardandoEstoque)}
          tone={aguardandoEstoque > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Pedidos aguardando pagamento"
          value={String(aguardandoPagamento)}
          tone={aguardandoPagamento > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Produtos com estoque baixo"
          value={String(lowStockProducts.length)}
          hint={`Limite: ${LOW_STOCK_THRESHOLD} unidades`}
          tone={lowStockProducts.length > 0 ? "critical" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos recentes</CardTitle>
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
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="max-w-[140px] truncate">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="hover:underline"
                      >
                        {order.user.name}
                      </Link>
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatBRL(Number(order.total))}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {recentOrders.length === 0 && (
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
                      <Link
                        href={`/admin/produtos/${product.id}`}
                        className="hover:underline"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {product.stockQty}
                    </TableCell>
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
    </div>
  );
}
