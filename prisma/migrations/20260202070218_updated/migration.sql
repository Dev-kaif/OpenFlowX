/*
  Warnings:

  - The values [CLOUDINARY,NOTION] on the enum `CredentialType` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLOUDINARY,NOTION] on the enum `NodeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CredentialType_new" AS ENUM ('OPENAI', 'OPENROUTER', 'GEMINI', 'ANTHROPIC', 'DEEPSEEK', 'XAI', 'POSTGRESS', 'GOOGLESHEETS', 'S3', 'R2', 'RESEND');
ALTER TABLE "Credential" ALTER COLUMN "type" TYPE "CredentialType_new" USING ("type"::text::"CredentialType_new");
ALTER TYPE "CredentialType" RENAME TO "CredentialType_old";
ALTER TYPE "CredentialType_new" RENAME TO "CredentialType";
DROP TYPE "public"."CredentialType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NodeType_new" AS ENUM ('INITIAL', 'MANUAL_TRIGGER', 'HTTP_REQUEST', 'GOOGLE_FORM_TRIGGER', 'STRIPE_TRIGGER', 'POLAR_TRIGGER', 'OPENROUTER', 'OPENAI', 'GEMINI', 'ANTHROPIC', 'DEEPSEEK', 'XAI', 'DISCORD', 'SLACK', 'IFELSE', 'DELAY', 'CODE', 'TEMPLATE', 'SEARCH', 'SCRAPER', 'POSTGRESS', 'GOOGLESHEETS', 'EMAIL_RESEND', 'FILE', 'S3', 'R2', 'SCHEDULE', 'JSON_PARSE');
ALTER TABLE "Node" ALTER COLUMN "type" TYPE "NodeType_new" USING ("type"::text::"NodeType_new");
ALTER TYPE "NodeType" RENAME TO "NodeType_old";
ALTER TYPE "NodeType_new" RENAME TO "NodeType";
DROP TYPE "public"."NodeType_old";
COMMIT;
