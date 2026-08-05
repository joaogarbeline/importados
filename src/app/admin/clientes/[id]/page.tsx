import Link from "next/link";
import { notFound } from "next/navigation";
import { MailIcon, MapPinIcon, PhoneIcon, HeartIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { OrderStatusBadge } from "@/components/admin/status-badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/admin/stat-card";
import { ShoppingBagIcon, ReceiptIcon } from "lucide-react";

export default async function AdminClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
    },
  });

  if (!customer || customer.role !== "CUSTOMER") notFound();

  const paidOrders = customer.orders.filter((o) => o.paidAt);
  const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgTicket = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

  const productCounts = new Map<string, { name: string; qty: number }>();
  for (const order of customer.orders) {
    for (const item of order.items) {
      const entry = productCounts.get(item.productId) ?? { name: item.product.name, qty: 0 };
      entry.qty += item.qty;
      productCounts.set(item.productId, entry);
    }
  }
  const favorites = Array.from(productCounts.entries())
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">{customer.name}</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Cliente desde {new Intl.DateTimeFormat("pt-BR").format(customer.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total gasto" value={formatBRL(totalSpent)} icon={ShoppingBagIcon} />
        <StatCard label="Pedidos pagos" value={String(paidOrders.length)} icon={ReceiptIcon} />
        <StatCard label="Ticket médio" value={formatBRL(avgTicket)} icon={ReceiptIcon} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Histórico de compras</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/admin/pedidos/${order.id}`} className="hover:underline">
                        #{order.id.slice(-8).toUpperCase()}
                      </Link>
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell className="tabular-nums">{formatBRL(Number(order.total))}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR").format(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
                {customer.orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
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
              <CardTitle className="flex items-center gap-2 text-base">
                <MailIcon className="size-4 text-primary" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-bold">{customer.email}</p>
              {customer.phone && (
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <PhoneIcon className="size-3.5" />
                  {customer.phone}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HeartIcon className="size-4 text-primary" />
                Produtos favoritos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {favorites.map(([productId, f]) => (
                <div key={productId} className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold">{f.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {f.qty}x
                  </span>
                </div>
              ))}
              {favorites.length === 0 && (
                <p className="text-muted-foreground">Ainda sem compras.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPinIcon className="size-4 text-primary" />
                Endereços
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
              {customer.addresses.map((a) => (
                <div key={a.id}>
                  <p className="font-bold text-foreground">{a.label}</p>
                  <p>
                    {a.rua}, {a.numero}
                    {a.complemento ? ` - ${a.complemento}` : ""}
                  </p>
                  <p>
                    {a.bairro} · {a.cidade}/{a.uf} — {a.cep}
                  </p>
                </div>
              ))}
              {customer.addresses.length === 0 && <p>Nenhum endereço cadastrado.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
