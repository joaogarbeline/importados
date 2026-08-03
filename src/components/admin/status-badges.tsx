import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

// Paleta de status (fixa, não-temática): good / warning / serious / critical.
const GOOD = "#0ca30c";
const WARNING = "#fab219";
const SERIOUS = "#ec835a";
const CRITICAL = "#d03b3b";
const INFO = "#2a78d6";

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        "border-border bg-secondary text-secondary-foreground"
      )}
    >
      <Dot color={color} />
      {label}
    </span>
  );
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  AGUARDANDO_ESTOQUE: "Aguardando estoque",
  LIBERADO_PARA_PAGAMENTO: "Liberado p/ pagamento",
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PAGO: "Pago",
  EM_PREPARACAO: "Em preparação",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
  PAGAMENTO_EXPIRADO: "Pagamento expirado",
};

const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  AGUARDANDO_ESTOQUE: WARNING,
  LIBERADO_PARA_PAGAMENTO: INFO,
  AGUARDANDO_PAGAMENTO: WARNING,
  PAGO: GOOD,
  EM_PREPARACAO: INFO,
  ENVIADO: INFO,
  ENTREGUE: GOOD,
  CANCELADO: CRITICAL,
  PAGAMENTO_EXPIRADO: CRITICAL,
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge color={ORDER_STATUS_COLOR[status]} label={ORDER_STATUS_LABEL[status]} />;
}

export function orderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABEL[status];
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
  ESTORNADO: "Estornado",
};

const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  PENDENTE: WARNING,
  APROVADO: GOOD,
  RECUSADO: CRITICAL,
  CANCELADO: CRITICAL,
  ESTORNADO: SERIOUS,
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge color={PAYMENT_STATUS_COLOR[status]} label={PAYMENT_STATUS_LABEL[status]} />;
}

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABEL) as [
  OrderStatus,
  string,
][];
