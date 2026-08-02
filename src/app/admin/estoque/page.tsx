import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddStockForm } from "@/components/admin/add-stock-form";

export default async function AdminEstoquePage() {
  const [products, movements] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true, stockQty: true },
    }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { product: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Estoque</h1>
        <p className="text-sm text-muted-foreground">
          Ao adicionar estoque, os pedidos pendentes são liberados
          automaticamente para pagamento por ordem de chegada, e o cliente é
          avisado por e-mail.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar ao estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <AddStockForm products={products} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Histórico de movimentações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {movement.product.name}
                  </TableCell>
                  <TableCell
                    className={
                      movement.qtyChange >= 0
                        ? "tabular-nums text-emerald-600"
                        : "tabular-nums text-destructive"
                    }
                  >
                    {movement.qtyChange >= 0 ? "+" : ""}
                    {movement.qtyChange}
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate text-muted-foreground">
                    {movement.reason}
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(movement.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {movements.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Nenhuma movimentação registrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
