-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'BOUNCED');

-- Add new columns (nullable first for existing rows)
ALTER TABLE "Subscriber" ADD COLUMN "status" "SubscriberStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Subscriber" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Subscriber" ADD COLUMN "verifyToken" TEXT;
ALTER TABLE "Subscriber" ADD COLUMN "unsubscribeToken" TEXT;
ALTER TABLE "Subscriber" ADD COLUMN "verifiedAt" TIMESTAMP(3);

-- Generate unique tokens for existing rows
UPDATE "Subscriber" SET "verifyToken" = gen_random_uuid()::TEXT WHERE "verifyToken" IS NULL;
UPDATE "Subscriber" SET "unsubscribeToken" = gen_random_uuid()::TEXT WHERE "unsubscribeToken" IS NULL;

-- Grandfather existing subscribers as verified + active
UPDATE "Subscriber" SET "status" = 'ACTIVE', "verified" = true, "verifiedAt" = "createdAt"; -- NOSONAR: intentionally updates all existing rows to grandfather them as verified

-- Make token columns NOT NULL
ALTER TABLE "Subscriber" ALTER COLUMN "verifyToken" SET NOT NULL;
ALTER TABLE "Subscriber" ALTER COLUMN "unsubscribeToken" SET NOT NULL;

-- Add unique constraints and indexes
CREATE UNIQUE INDEX "Subscriber_verifyToken_key" ON "Subscriber"("verifyToken");
CREATE UNIQUE INDEX "Subscriber_unsubscribeToken_key" ON "Subscriber"("unsubscribeToken");
CREATE INDEX "Subscriber_verifyToken_idx" ON "Subscriber"("verifyToken");
CREATE INDEX "Subscriber_unsubscribeToken_idx" ON "Subscriber"("unsubscribeToken");
