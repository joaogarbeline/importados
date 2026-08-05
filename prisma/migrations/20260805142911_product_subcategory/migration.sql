-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "subcategory" TEXT;

-- CreateIndex
CREATE INDEX "Product_category_subcategory_idx" ON "Product"("category", "subcategory");

