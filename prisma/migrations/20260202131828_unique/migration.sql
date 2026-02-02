/*
  Warnings:

  - A unique constraint covering the columns `[executionId,nodeId]` on the table `ExecutionStep` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExecutionStep_executionId_nodeId_key" ON "ExecutionStep"("executionId", "nodeId");
