-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'HTTP_REQUEST_TOOL';
ALTER TYPE "NodeType" ADD VALUE 'SEARCH_TOOL';
ALTER TYPE "NodeType" ADD VALUE 'SCRAPER_TOOL';
ALTER TYPE "NodeType" ADD VALUE 'POSTGRESS_TOOL';
ALTER TYPE "NodeType" ADD VALUE 'GOOGLESHEETS_TOOL';
ALTER TYPE "NodeType" ADD VALUE 'EMAIL_RESEND_TOOL';
