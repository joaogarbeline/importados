"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Logo } from "@/components/logo";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="dark w-64 gap-0 bg-sidebar p-0 text-sidebar-foreground">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="border-b border-sidebar-border px-4 py-4">
          <Logo tagline="Painel administrativo" />
        </div>
        <div onClick={() => setOpen(false)}>
          <AdminSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
