/*
  Warnings:

  - You are about to drop the `fcm_token` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."fcm_token" DROP CONSTRAINT "fcm_token_userId_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "matriculado" BOOLEAN;

-- DropTable
DROP TABLE "public"."fcm_token";
