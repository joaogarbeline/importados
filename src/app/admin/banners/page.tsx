import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BannerForm } from "@/components/admin/banner-form";
import { toggleBannerActiveAction, deleteBannerAction } from "./actions";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Banners</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie o carrossel de banners exibido na home da loja.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo banner</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {banners.length} banner(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {banners.map((banner) => {
              const toggleAction = toggleBannerActiveAction.bind(
                null,
                banner.id,
                !banner.active
              );
              const removeAction = deleteBannerAction.bind(null, banner.id);
              return (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className="font-medium">{banner.title ?? "(sem título)"}</p>
                    <p className="text-xs text-muted-foreground">
                      {banner.subtitle ?? "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ordem: {banner.order}
                      {banner.linkUrl ? ` · Link: ${banner.linkUrl}` : ""}
                    </p>
                  </div>
                  {banner.active ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="outline">Inativo</Badge>
                  )}
                  <form action={toggleAction}>
                    <Button type="submit" variant="ghost" size="sm">
                      {banner.active ? "Desativar" : "Ativar"}
                    </Button>
                  </form>
                  <form action={removeAction}>
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      Excluir
                    </Button>
                  </form>
                </div>
              );
            })}
            {banners.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                Nenhum banner cadastrado ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
