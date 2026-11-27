ALTER TABLE "Property"
  ALTER COLUMN "priceMxn" DROP NOT NULL,
  ALTER COLUMN "municipality" DROP NOT NULL,
  ALTER COLUMN "neighborhood" DROP NOT NULL,
  ALTER COLUMN "bedrooms" DROP NOT NULL,
  ALTER COLUMN "bathrooms" DROP NOT NULL,
  ALTER COLUMN "parkingSpaces" DROP NOT NULL;

CREATE TABLE "PropertySlugRedirect" (
  "slug" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PropertySlugRedirect_pkey" PRIMARY KEY ("slug")
);
CREATE INDEX "PropertySlugRedirect_propertyId_idx" ON "PropertySlugRedirect"("propertyId");
ALTER TABLE "PropertySlugRedirect"
  ADD CONSTRAINT "PropertySlugRedirect_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "auth_user" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auth_user_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "auth_user_email_key" ON "auth_user"("email");

CREATE TABLE "auth_session" (
  "id" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL,
  CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "auth_session_token_key" ON "auth_session"("token");
CREATE INDEX "auth_session_userId_idx" ON "auth_session"("userId");
ALTER TABLE "auth_session"
  ADD CONSTRAINT "auth_session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "auth_user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "auth_account" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auth_account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "auth_account_providerId_accountId_key"
  ON "auth_account"("providerId", "accountId");
CREATE INDEX "auth_account_userId_idx" ON "auth_account"("userId");
ALTER TABLE "auth_account"
  ADD CONSTRAINT "auth_account_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "auth_user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "auth_verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auth_verification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "auth_verification_identifier_idx" ON "auth_verification"("identifier");
