import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { formatBRL } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_BADGE_VARIANT,
} from "@/components/storefront/order-status";

export default async function MinhaContaPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold">Minha conta</h1>

      <Card className="mt-6 flex flex-col gap-1 p-5">
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </Card>

      <h2 className="mt-8 font-heading text-lg font-semibold">Meus pedidos</h2>

      {orders.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            Você ainda não fez nenhum pedido.
          </p>
          <Link href="/loja" className="font-medium underline">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/minha-conta/pedidos/${order.id}`}>
              <Card className="flex flex-row items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    Pedido #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} item(ns) ·{" "}
                    {order.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-medium">
                    {formatBRL(order.total)}
                  </span>
                  <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
