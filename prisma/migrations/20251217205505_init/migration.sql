-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'STUDIO', 'MAISONETTE', 'PENTHOUSE', 'COMMERCIAL', 'LAND', 'GARAGE');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BGN',
    "pricePerSqm" DECIMAL(65,30),
    "propertyType" "PropertyType" NOT NULL,
    "area" DECIMAL(65,30) NOT NULL,
    "rooms" INTEGER,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "yearBuilt" INTEGER,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "sourceUrl" TEXT,
    "sourceSite" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "POICategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBg" TEXT NOT NULL,
    "icon" TEXT,
    "googleType" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "POICategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPOI" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "walkingMinutes" INTEGER,
    "drivingMinutes" INTEGER,
    "transitMinutes" INTEGER,
    "googlePlaceId" TEXT,
    "rating" DECIMAL(65,30),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPOI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "groceryWeight" INTEGER NOT NULL DEFAULT 5,
    "kindergartenWeight" INTEGER NOT NULL DEFAULT 5,
    "schoolWeight" INTEGER NOT NULL DEFAULT 5,
    "hospitalWeight" INTEGER NOT NULL DEFAULT 5,
    "pharmacyWeight" INTEGER NOT NULL DEFAULT 5,
    "transportWeight" INTEGER NOT NULL DEFAULT 5,
    "parkWeight" INTEGER NOT NULL DEFAULT 3,
    "gymWeight" INTEGER NOT NULL DEFAULT 3,
    "customPriorities" JSONB,
    "maxCommuteMinutes" INTEGER,
    "commuteToAddress" TEXT,
    "commuteToLat" DECIMAL(65,30),
    "commuteToLng" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_sourceUrl_key" ON "Property"("sourceUrl");

-- CreateIndex
CREATE INDEX "Property_city_propertyType_idx" ON "Property"("city", "propertyType");

-- CreateIndex
CREATE INDEX "Property_latitude_longitude_idx" ON "Property"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "POICategory_name_key" ON "POICategory"("name");

-- CreateIndex
CREATE INDEX "PropertyPOI_propertyId_categoryId_idx" ON "PropertyPOI"("propertyId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyPOI_propertyId_googlePlaceId_key" ON "PropertyPOI"("propertyId", "googlePlaceId");

-- CreateIndex
CREATE INDEX "UserPreference_userId_idx" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "UserPreference_sessionId_idx" ON "UserPreference"("sessionId");

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPOI" ADD CONSTRAINT "PropertyPOI_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPOI" ADD CONSTRAINT "PropertyPOI_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "POICategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
