/*
  Warnings:

  - Added the required column `stepIndex` to the `ExecutionStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExecutionStep" ADD COLUMN     "stepIndex" INTEGER NOT NULL;
