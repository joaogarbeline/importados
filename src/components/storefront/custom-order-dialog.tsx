"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createCustomOrderRequestAction,
  type CustomOrderState,
} from "@/app/(store)/actions";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
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

const initialState: CustomOrderState = undefined;

export function CustomOrderDialog({
  triggerLabel = "Fazer minha encomenda",
  variant,
  className,
}: {
  triggerLabel?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createCustomOrderRequestAction,
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => setOpen(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="lg" variant={variant} className={className} />}
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Não achou o que procura? Não se preocupe!</DialogTitle>
          <DialogDescription>
            Conte pra gente o produto que você quer e a gente traz sob
            encomenda pra você.
          </DialogDescription>
        </DialogHeader>

        {state?.success ? (
          <Alert>
            <AlertDescription>
              Recebemos sua encomenda! Em breve entramos em contato.
            </AlertDescription>
          </Alert>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">O que você está procurando?</Label>
              <Textarea id="description" name="description" rows={4} required />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando..." : "Enviar encomenda"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
