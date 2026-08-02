"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createServiceRequestAction,
  type ServiceRequestState,
} from "@/app/(store)/servicos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: ServiceRequestState = undefined;

export function ServiceRequestDialog({
  serviceId,
  serviceName,
}: {
  serviceId?: string;
  serviceName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createServiceRequestAction,
    initialState
  );

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="w-full" />}>
        Solicitar orçamento
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar orçamento</DialogTitle>
          <DialogDescription>
            {serviceName
              ? `Conte mais sobre o que você precisa para "${serviceName}".`
              : "Conte mais sobre o que você precisa e retornaremos em breve."}
          </DialogDescription>
        </DialogHeader>

        {state?.success ? (
          <Alert>
            <AlertDescription>
              Solicitação enviada! Em breve entraremos em contato.
            </AlertDescription>
          </Alert>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            {serviceId && (
              <input type="hidden" name="serviceId" value={serviceId} />
            )}

            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefone">Telefone (opcional)</Label>
              <Input id="telefone" name="telefone" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descricao">O que você precisa?</Label>
              <Textarea id="descricao" name="descricao" rows={4} required />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando..." : "Enviar solicitação"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
