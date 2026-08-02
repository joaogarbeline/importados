import type { OrderStatus } from "@/generated/prisma/enums";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  AGUARDANDO_ESTOQUE: "Aguardando chegada do estoque",
  LIBERADO_PARA_PAGAMENTO: "Pagamento liberado — finalize sua compra",
  AGUARDANDO_PAGAMENTO: "Aguardando confirmação do pagamento",
  PAGO: "Pagamento confirmado",
  EM_PREPARACAO: "Em preparação",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
  PAGAMENTO_EXPIRADO: "Pagamento expirado",
};

export const ORDER_STATUS_BADGE_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  AGUARDANDO_ESTOQUE: "secondary",
  LIBERADO_PARA_PAGAMENTO: "default",
  AGUARDANDO_PAGAMENTO: "outline",
  PAGO: "default",
  EM_PREPARACAO: "outline",
  ENVIADO: "outline",
  ENTREGUE: "secondary",
  CANCELADO: "destructive",
  PAGAMENTO_EXPIRADO: "destructive",
};

export const CANCELABLE_STATUSES: OrderStatus[] = [
  "AGUARDANDO_ESTOQUE",
  "LIBERADO_PARA_PAGAMENTO",
];
