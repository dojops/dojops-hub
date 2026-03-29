-- AlterTable: add externalId, change githubId from Int to String
-- Step 1: Add externalId column
ALTER TABLE "User" ADD COLUMN "externalId" TEXT;
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");
CREATE INDEX "User_externalId_idx" ON "User"("externalId");

-- Step 2: Convert githubId from Int to String (nullable)
-- First, create a temp column, copy data, drop old, rename
ALTER TABLE "User" ADD COLUMN "githubId_new" TEXT;
UPDATE "User" SET "githubId_new" = "githubId"::TEXT;
DROP INDEX IF EXISTS "User_githubId_key";
ALTER TABLE "User" DROP COLUMN "githubId";
ALTER TABLE "User" RENAME COLUMN "githubId_new" TO "githubId";
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
