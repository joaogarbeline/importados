import { CartProvider } from "@/components/storefront/cart-provider";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SalesPopup } from "@/components/storefront/sales-popup";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SalesPopup />
    </CartProvider>
  );
}
