-- AlterEnum
ALTER TYPE "CredentialType" ADD VALUE 'RESEND';

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_workflowId_fkey";

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
