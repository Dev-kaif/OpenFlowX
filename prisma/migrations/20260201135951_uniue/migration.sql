/*
  Warnings:

  - A unique constraint covering the columns `[nodeId]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Schedule_nodeId_key" ON "Schedule"("nodeId");
