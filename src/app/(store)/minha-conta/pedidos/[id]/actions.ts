"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cancelOrder } from "@/lib/orders";
import { requireUser } from "@/lib/auth-helpers";
import { CANCELABLE_STATUSES } from "@/components/storefront/order-status";

export async function cancelMyOrderAction(orderId: string) {
  const user = await requireUser();

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
  });

  if (order.userId !== user.id) {
    throw new Error("Você não tem permissão para cancelar este pedido.");
  }

  if (!CANCELABLE_STATUSES.includes(order.status)) {
    throw new Error("Este pedido não pode mais ser cancelado.");
  }

  await cancelOrder(orderId);
  revalidatePath(`/minha-conta/pedidos/${orderId}`);
  revalidatePath("/minha-conta");
}
