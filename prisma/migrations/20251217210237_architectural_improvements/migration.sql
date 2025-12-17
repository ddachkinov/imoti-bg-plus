/*
  Warnings:

  - You are about to drop the column `googleType` on the `POICategory` table. All the data in the column will be lost.
  - You are about to drop the column `customPriorities` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `groceryWeight` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `gymWeight` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalWeight` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `kindergartenWeight` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `parkWeight` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `pharmacyWeight` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `schoolWeight` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `transportWeight` on the `UserPreference` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PropertyPOI" DROP CONSTRAINT "PropertyPOI_categoryId_fkey";

-- AlterTable
ALTER TABLE "POICategory" DROP COLUMN "googleType",
ADD COLUMN     "googleTypes" TEXT[],
ADD COLUMN     "searchRadius" INTEGER NOT NULL DEFAULT 1000;

-- AlterTable
ALTER TABLE "UserPreference" DROP COLUMN "customPriorities",
DROP COLUMN "groceryWeight",
DROP COLUMN "gymWeight",
DROP COLUMN "hospitalWeight",
DROP COLUMN "kindergartenWeight",
DROP COLUMN "parkWeight",
DROP COLUMN "pharmacyWeight",
DROP COLUMN "schoolWeight",
DROP COLUMN "transportWeight",
ADD COLUMN     "categoryWeights" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyPOI_googlePlaceId_idx" ON "PropertyPOI"("googlePlaceId");

-- AddForeignKey
ALTER TABLE "PropertyPOI" ADD CONSTRAINT "PropertyPOI_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "POICategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
