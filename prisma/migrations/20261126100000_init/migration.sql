CREATE TYPE "PropertyStatus" AS ENUM ('draft', 'available', 'reserved', 'sold', 'withdrawn');
CREATE TYPE "PropertyOperation" AS ENUM ('sale', 'rent');

CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "publicCode" TEXT NOT NULL,
    "sourceReference" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "operation" "PropertyOperation" NOT NULL DEFAULT 'sale',
    "status" "PropertyStatus" NOT NULL DEFAULT 'draft',
    "priceMxn" DECIMAL(14,2) NOT NULL,
    "municipality" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" DECIMAL(3,1) NOT NULL,
    "parkingSpaces" INTEGER NOT NULL,
    "constructionAreaSqm" DECIMAL(10,2),
    "landAreaSqm" DECIMAL(10,2),
    "amenities" TEXT[] NOT NULL,
    "photos" JSONB NOT NULL,
    "approximateLocation" JSONB,
    "tourUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "authorizationReference" TEXT,
    "partnerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Property_publicCode_key" ON "Property"("publicCode");
CREATE UNIQUE INDEX "Property_sourceReference_key" ON "Property"("sourceReference");
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
CREATE INDEX "Property_status_operation_priceMxn_idx" ON "Property"("status", "operation", "priceMxn");
CREATE INDEX "Property_municipality_neighborhood_status_idx" ON "Property"("municipality", "neighborhood", "status");
