"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshCwIcon, Undo2Icon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPaymentStatusAction, syncPaymentAction } from "@/app/admin/pagamentos/actions";
import type { PaymentStatus } from "@/generated/prisma/enums";

export function PaymentActions({
  paymentId,
  status,
  hasMpPaymentId,
}: {
  paymentId: string;
  status: PaymentStatus;
  hasMpPaymentId: boolean;
}) {
  const [syncing, startSync] = useTransition();
  const [updating, startUpdate] = useTransition();

  function handleSync() {
    startSync(async () => {
      const result = await syncPaymentAction(paymentId);
      if (result?.error) toast.error(result.error);
      else if (result?.success) toast.success(result.success);
    });
  }

  function handleSetStatus(next: PaymentStatus) {
    startUpdate(async () => {
      try {
        await setPaymentStatusAction(paymentId, next);
        toast.success(
          next === "ESTORNADO" ? "Pagamento marcado como estornado." : "Pagamento marcado como cancelado."
        );
      } catch {
        toast.error("Não foi possível atualizar o pagamento.");
      }
    });
  }

  const canRefund = status === "APROVADO" || status === "PENDENTE";
  const canCancel = status === "PENDENTE";
  const pending = syncing || updating;

  return (
    <div className="flex items-center gap-1">
      {hasMpPaymentId && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          title="Sincronizar com o Mercado Pago"
          disabled={pending}
          onClick={handleSync}
        >
          <RefreshCwIcon className={syncing ? "size-3.5 animate-spin" : "size-3.5"} />
        </Button>
      )}
      {canRefund && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          title="Marcar como estornado"
          disabled={pending}
          onClick={() => handleSetStatus("ESTORNADO")}
        >
          <Undo2Icon className="size-3.5" />
        </Button>
      )}
      {canCancel && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          title="Marcar como cancelado"
          disabled={pending}
          onClick={() => handleSetStatus("CANCELADO")}
        >
          <XCircleIcon className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
