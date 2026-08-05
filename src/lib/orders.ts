import { prisma } from "@/lib/prisma";
import { getMpPreference, getMpPayment } from "@/lib/mercadopago";
import {
  sendOrderCreatedEmail,
  sendPaymentReleasedEmail,
  sendPaymentConfirmedEmail,
  sendOrderCancelledEmail,
} from "@/lib/emails";
import type { PaymentStatus } from "@/generated/prisma/enums";

export function mapMpPaymentStatus(mpStatus: string | undefined): PaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "APROVADO";
    case "rejected":
      return "RECUSADO";
    case "cancelled":
      return "CANCELADO";
    case "refunded":
    case "charged_back":
      return "ESTORNADO";
    default:
      return "PENDENTE";
  }
}

/**
 * Busca o pagamento na API do Mercado Pago e aplica o status no banco,
 * incluindo a liberação do pedido para PAGO e o e-mail de confirmação.
 * Usado tanto pelo webhook quanto pela sincronização manual no admin.
 */
export async function syncPaymentFromMercadoPago(mpPaymentId: string) {
  const payment = await getMpPayment().get({ id: mpPaymentId });
  const orderId = payment.external_reference;
  if (!orderId) return null;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  const status = mapMpPaymentStatus(payment.status);

  await prisma.payment.upsert({
    where: { mpPaymentId: String(mpPaymentId) },
    update: {
      status,
      method: payment.payment_type_id,
      rawPayload: payment as unknown as object,
    },
    create: {
      orderId: order.id,
      mpPaymentId: String(mpPaymentId),
      status,
      method: payment.payment_type_id,
      amount: payment.transaction_amount ?? Number(order.total),
      rawPayload: payment as unknown as object,
    },
  });

  if (status === "APROVADO" && order.status !== "PAGO") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAGO", paidAt: new Date() },
    });
    await sendPaymentConfirmedEmail(order.id);
  } else if (status === "PENDENTE" && order.status === "LIBERADO_PARA_PAGAMENTO") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "AGUARDANDO_PAGAMENTO" },
    });
  }

  return status;
}

export async function createOrder(input: {
  userId: string;
  shippingAddressId?: string;
  notes?: string;
  items: { productId: string; qty: number }[];
}) {
  if (input.items.length === 0) {
    throw new Error("O pedido precisa ter ao menos um item");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, active: true },
  });

  if (products.length !== new Set(input.items.map((i) => i.productId)).size) {
    throw new Error("Um ou mais produtos não estão disponíveis");
  }

  const priceByProduct = new Map(products.map((p) => [p.id, p.price]));

  const orderItemsData = input.items.map((i) => ({
    productId: i.productId,
    qty: i.qty,
    unitPrice: priceByProduct.get(i.productId)!,
  }));

  const subtotal = orderItemsData.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.qty,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId: input.userId,
      shippingAddressId: input.shippingAddressId,
      notes: input.notes,
      subtotal,
      total: subtotal,
      items: { create: orderItemsData },
    },
  });

  await sendOrderCreatedEmail(order.id);

  const distinctProductIds = [...new Set(input.items.map((i) => i.productId))];
  for (const productId of distinctProductIds) {
    await releaseOrdersForProduct(productId);
  }

  return order;
}

export async function addStock(
  productId: string,
  qtyAdded: number,
  reason: string
) {
  if (qtyAdded <= 0) {
    throw new Error("A quantidade adicionada deve ser positiva");
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { stockQty: { increment: qtyAdded } },
    }),
    prisma.stockMovement.create({
      data: { productId, qtyChange: qtyAdded, reason },
    }),
  ]);

  return releaseOrdersForProduct(productId);
}

/**
 * Registra uma saída manual de estoque (perda, avaria, ajuste de inventário
 * etc.). Diferente de `addStock`, nunca libera pedidos pendentes.
 */
export async function removeStock(
  productId: string,
  qtyRemoved: number,
  reason: string
) {
  if (qtyRemoved <= 0) {
    throw new Error("A quantidade removida deve ser positiva");
  }

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
  });

  if (product.stockQty - qtyRemoved < 0) {
    throw new Error("Estoque insuficiente para essa saída");
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { stockQty: { decrement: qtyRemoved } },
    }),
    prisma.stockMovement.create({
      data: { productId, qtyChange: -qtyRemoved, reason },
    }),
  ]);
}

/**
 * Aloca estoque para pedidos pendentes por ordem de chegada (FIFO) e libera
 * o pagamento (Preference Mercado Pago + e-mail) de todo pedido cujos itens
 * ficaram 100% alocados.
 */
export async function releaseOrdersForProduct(productId: string) {
  const releasedOrderIds = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({
      where: { id: productId },
    });

    let available = product.stockQty;
    if (available <= 0) return [];

    const pendingItems = await tx.orderItem.findMany({
      where: {
        productId,
        stockAllocated: false,
        order: { status: "AGUARDANDO_ESTOQUE" },
      },
      orderBy: { order: { createdAt: "asc" } },
    });

    const touchedOrderIds = new Set<string>();

    for (const item of pendingItems) {
      if (available < item.qty) continue;

      available -= item.qty;
      await tx.orderItem.update({
        where: { id: item.id },
        data: { stockAllocated: true },
      });
      await tx.stockMovement.create({
        data: {
          productId,
          qtyChange: -item.qty,
          reason: `Reservado para o pedido ${item.orderId}`,
        },
      });
      touchedOrderIds.add(item.orderId);
    }

    if (available !== product.stockQty) {
      await tx.product.update({
        where: { id: productId },
        data: { stockQty: available },
      });
    }

    const releasedOrderIds: string[] = [];

    for (const orderId of touchedOrderIds) {
      const remainingUnallocated = await tx.orderItem.count({
        where: { orderId, stockAllocated: false },
      });

      if (remainingUnallocated === 0) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "LIBERADO_PARA_PAGAMENTO", releasedAt: new Date() },
        });
        releasedOrderIds.push(orderId);
      }
    }

    return releasedOrderIds;
  });

  for (const orderId of releasedOrderIds) {
    await createPaymentLinkForOrder(orderId);
  }

  return releasedOrderIds;
}

export async function createPaymentLinkForOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { product: true } }, user: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const preference = await getMpPreference().create({
    body: {
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.product.name,
        quantity: item.qty,
        currency_id: "BRL",
        unit_price: Number(item.unitPrice),
      })),
      external_reference: order.id,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${appUrl}/minha-conta/pedidos/${order.id}`,
        pending: `${appUrl}/minha-conta/pedidos/${order.id}`,
        failure: `${appUrl}/minha-conta/pedidos/${order.id}`,
      },
      payer: { email: order.user.email, name: order.user.name },
    },
  });

  const paymentLink = preference.init_point ?? preference.sandbox_init_point ?? null;

  await prisma.payment.create({
    data: {
      orderId: order.id,
      mpPreferenceId: preference.id,
      initPoint: paymentLink,
      status: "PENDENTE",
      amount: order.total,
    },
  });

  if (paymentLink) {
    await sendPaymentReleasedEmail(order.id, paymentLink);
  }

  return paymentLink;
}

/**
 * Reenvia o e-mail de pagamento usando o link já existente (se houver um
 * pagamento pendente) ou gera uma nova Preference no Mercado Pago.
 */
export async function resendPaymentLink(orderId: string) {
  const existing = await prisma.payment.findFirst({
    where: { orderId, status: "PENDENTE" },
    orderBy: { createdAt: "desc" },
  });

  if (existing?.initPoint) {
    await sendPaymentReleasedEmail(orderId, existing.initPoint);
    return existing.initPoint;
  }

  return createPaymentLinkForOrder(orderId);
}

export async function cancelOrder(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.stockAllocated) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.qty } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            qtyChange: item.qty,
            reason: `Devolução por cancelamento do pedido ${orderId}`,
          },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELADO" },
    });
  });

  await sendOrderCancelledEmail(orderId);

  const distinctProductIds = [...new Set(order.items.map((i) => i.productId))];
  for (const productId of distinctProductIds) {
    await releaseOrdersForProduct(productId);
  }
}
