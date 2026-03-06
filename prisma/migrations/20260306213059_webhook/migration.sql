/*
  Warnings:

  - The values [WEBHOOK] on the enum `NodeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NodeType_new" AS ENUM ('INITIAL', 'MANUAL_TRIGGER', 'HTTP_REQUEST', 'WEBHOOK_TRIGGER', 'GOOGLE_FORM_TRIGGER', 'STRIPE_TRIGGER', 'POLAR_TRIGGER', 'TELEGRAM_TRIGGER', 'OPENROUTER', 'OPENAI', 'GEMINI', 'ANTHROPIC', 'DEEPSEEK', 'XAI', 'DISCORD', 'SLACK', 'IFELSE', 'DELAY', 'CODE', 'TEMPLATE', 'SEARCH', 'SCRAPER', 'POSTGRESS', 'GOOGLESHEETS', 'EMAIL_RESEND', 'FILE', 'S3', 'R2', 'SCHEDULE', 'JSON_PARSE', 'TELEGRAM', 'DOCUMENT_READER', 'AGENT', 'HTTP_REQUEST_TOOL', 'SEARCH_TOOL', 'SCRAPER_TOOL', 'POSTGRESS_TOOL', 'GOOGLESHEETS_TOOL', 'EMAIL_RESEND_TOOL');
ALTER TABLE "Node" ALTER COLUMN "type" TYPE "NodeType_new" USING ("type"::text::"NodeType_new");
ALTER TABLE "ExecutionStep" ALTER COLUMN "nodeType" TYPE "NodeType_new" USING ("nodeType"::text::"NodeType_new");
ALTER TYPE "NodeType" RENAME TO "NodeType_old";
ALTER TYPE "NodeType_new" RENAME TO "NodeType";
DROP TYPE "public"."NodeType_old";
COMMIT;
