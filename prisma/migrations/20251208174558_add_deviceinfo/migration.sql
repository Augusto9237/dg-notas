/*
  Warnings:

  - You are about to drop the `FcmToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FcmToken" DROP CONSTRAINT "FcmToken_userId_fkey";

-- DropTable
DROP TABLE "public"."FcmToken";

-- CreateTable
CREATE TABLE "fcm_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fcm_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fcm_token_token_idx" ON "fcm_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "fcm_token_userId_token_key" ON "fcm_token"("userId", "token");

-- AddForeignKey
ALTER TABLE "fcm_token" ADD CONSTRAINT "fcm_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
