"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateServiceRequestStatusAction } from "@/app/admin/servicos/actions";
import { SERVICE_REQUEST_STATUS_OPTIONS } from "@/components/admin/status-badges";
import type { ServiceRequestStatus } from "@/generated/prisma/enums";

export function ServiceRequestStatusSelect({
  requestId,
  status,
}: {
  requestId: string;
  status: ServiceRequestStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(value: string | null) {
    if (!value) return;
    startTransition(() => {
      updateServiceRequestStatusAction(
        requestId,
        value as ServiceRequestStatus
      );
    });
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="h-7 w-40" disabled={pending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SERVICE_REQUEST_STATUS_OPTIONS.map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
