-- AlterTable: Add v2 metadata fields to Version model
ALTER TABLE "Version" ADD COLUMN "detection" JSONB;
ALTER TABLE "Version" ADD COLUMN "verification" JSONB;
ALTER TABLE "Version" ADD COLUMN "scope" JSONB;
ALTER TABLE "Version" ADD COLUMN "execution" JSONB;
ALTER TABLE "Version" ADD COLUMN "updateConfig" JSONB;
ALTER TABLE "Version" ADD COLUMN "capabilities" JSONB;
