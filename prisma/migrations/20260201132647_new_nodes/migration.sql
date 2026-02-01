-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'EMAIL_RESEND';
ALTER TYPE "NodeType" ADD VALUE 'FILE';
ALTER TYPE "NodeType" ADD VALUE 'S3';
ALTER TYPE "NodeType" ADD VALUE 'R2';
ALTER TYPE "NodeType" ADD VALUE 'CLOUDINARY';
ALTER TYPE "NodeType" ADD VALUE 'NOTION';
ALTER TYPE "NodeType" ADD VALUE 'SCHEDULE';
