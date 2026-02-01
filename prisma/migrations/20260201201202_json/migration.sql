/*
  Warnings:

  - The values [JSON_PARSE] on the enum `CredentialType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CredentialType_new" AS ENUM ('OPENAI', 'OPENROUTER', 'GEMINI', 'ANTHROPIC', 'DEEPSEEK', 'XAI', 'POSTGRESS', 'GOOGLESHEETS', 'S3', 'R2', 'CLOUDINARY', 'NOTION', 'RESEND');
ALTER TABLE "Credential" ALTER COLUMN "type" TYPE "CredentialType_new" USING ("type"::text::"CredentialType_new");
ALTER TYPE "CredentialType" RENAME TO "CredentialType_old";
ALTER TYPE "CredentialType_new" RENAME TO "CredentialType";
DROP TYPE "public"."CredentialType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'JSON_PARSE';
