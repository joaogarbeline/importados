"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { cancelOrder, resendPaymentLink } from "@/lib/orders";
import { sendOrderShippedEmail } from "@/lib/emails";

export async function resendLinkAction(orderId: string) {
  await requireAdmin();
  await resendPaymentLink(orderId);
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function cancelOrderAction(orderId: string) {
  await requireAdmin();
  await cancelOrder(orderId);
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos");
}

export async function markPreparingAction(orderId: string) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "EM_PREPARACAO" },
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function markShippedAction(orderId: string) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "ENVIADO" },
  });
  await sendOrderShippedEmail(orderId);
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function markDeliveredAction(orderId: string) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "ENTREGUE" },
  });
  revalidatePath(`/admin/pedidos/${orderId}`);
}
