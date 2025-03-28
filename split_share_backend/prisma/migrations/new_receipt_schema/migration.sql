/*
  Warnings:

  - Changed the type of `date` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `subtotal` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tax` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tip` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data.
  - Changed the type of `total` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `quantity` on the `Item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `unitPrice` on the `Item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `total` on the `Item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "quantity",
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL,
DROP COLUMN "unitPrice",
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL,
DROP COLUMN "total",
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "subtotal",
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
DROP COLUMN "tax",
ADD COLUMN     "tax" DOUBLE PRECISION NOT NULL,
DROP COLUMN "tip",
ADD COLUMN     "tip" DOUBLE PRECISION,
DROP COLUMN "total",
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;
