-- AlterEnum
BEGIN;
CREATE TYPE "EmailType_new" AS ENUM ('PEDIDO_CRIADO', 'PAGAMENTO_LIBERADO', 'PAGAMENTO_CONFIRMADO', 'PEDIDO_ENVIADO', 'PEDIDO_CANCELADO');
ALTER TABLE "EmailLog" ALTER COLUMN "type" TYPE "EmailType_new" USING ("type"::text::"EmailType_new");
ALTER TYPE "EmailType" RENAME TO "EmailType_old";
ALTER TYPE "EmailType_new" RENAME TO "EmailType";
DROP TYPE "EmailType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_userId_fkey";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "ServiceRequest";

-- DropEnum
DROP TYPE "ServicePriceType";

-- DropEnum
DROP TYPE "ServiceComplexity";

-- DropEnum
DROP TYPE "ServiceRequestStatus";

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

