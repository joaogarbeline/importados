import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMpPayment } from "@/lib/mercadopago";
import { sendPaymentConfirmedEmail } from "@/lib/emails";
import type { PaymentStatus } from "@/generated/prisma/enums";

function mapPaymentStatus(mpStatus: string | undefined): PaymentStatus {
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

export async function POST(request: NextRequest) {
  let body: { type?: string; data?: { id?: string } } = {};
  try {
    body = await request.json();
  } catch {
    // notificações de teste às vezes vêm sem corpo
  }

  const searchParams = request.nextUrl.searchParams;
  const type = body.type ?? searchParams.get("type") ?? searchParams.get("topic");
  const paymentId = body.data?.id ?? searchParams.get("data.id") ?? searchParams.get("id");

  if (type !== "payment" || !paymentId) {
    return NextResponse.json({ received: true });
  }

  try {
    const payment = await getMpPayment().get({ id: paymentId });
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ received: true });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ received: true });

    const status = mapPaymentStatus(payment.status);

    await prisma.payment.upsert({
      where: { mpPaymentId: String(paymentId) },
      update: {
        status,
        method: payment.payment_type_id,
        rawPayload: payment as unknown as object,
      },
      create: {
        orderId: order.id,
        mpPaymentId: String(paymentId),
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
    } else if (
      status === "PENDENTE" &&
      order.status === "LIBERADO_PARA_PAGAMENTO"
    ) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "AGUARDANDO_PAGAMENTO" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook do Mercado Pago:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
