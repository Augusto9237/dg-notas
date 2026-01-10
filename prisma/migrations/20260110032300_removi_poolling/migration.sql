/*
  Warnings:

  - You are about to drop the `notification_queue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."notification_queue" DROP CONSTRAINT "notification_queue_userId_fkey";

-- DropTable
DROP TABLE "public"."notification_queue";
