import { NextRequest, NextResponse } from "next/server";
import { syncPaymentFromMercadoPago } from "@/lib/orders";

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
    await syncPaymentFromMercadoPago(String(paymentId));
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook do Mercado Pago:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
