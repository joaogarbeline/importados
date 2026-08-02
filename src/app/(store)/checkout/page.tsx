import { CheckoutForm } from "@/components/storefront/checkout-form";
import { requireUser } from "@/lib/auth-helpers";

export default async function CheckoutPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold">
        Finalizar compra
      </h1>
      <div className="mt-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
