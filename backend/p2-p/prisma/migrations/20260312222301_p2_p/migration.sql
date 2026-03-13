/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Trade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotencyKey` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashedPassword` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FundingType" AS ENUM ('deposit', 'withdrawal');

-- CreateEnum
CREATE TYPE "FundingStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "SwapStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin', 'moderator');

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "idempotencyKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "hashedPassword" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user',
ALTER COLUMN "walletAddress" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "FundingType" NOT NULL,
    "asset" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "FundingStatus" NOT NULL DEFAULT 'pending',
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Funding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Swap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromAsset" TEXT NOT NULL,
    "toAsset" TEXT NOT NULL,
    "fromAmount" DECIMAL(65,30) NOT NULL,
    "toAmount" DECIMAL(65,30) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "status" "SwapStatus" NOT NULL DEFAULT 'pending',
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_asset_key" ON "Wallet"("userId", "asset");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_walletAddress_asset_key" ON "Wallet"("walletAddress", "asset");

-- CreateIndex
CREATE UNIQUE INDEX "Funding_reference_key" ON "Funding"("reference");

-- CreateIndex
CREATE INDEX "Funding_userId_status_idx" ON "Funding"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Swap_reference_key" ON "Swap"("reference");

-- CreateIndex
CREATE INDEX "Swap_userId_status_idx" ON "Swap"("userId", "status");

-- CreateIndex
CREATE INDEX "Offer_userId_status_idx" ON "Offer"("userId", "status");

-- CreateIndex
CREATE INDEX "Offer_asset_status_idx" ON "Offer"("asset", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_idempotencyKey_key" ON "Trade"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Trade_buyerId_status_idx" ON "Trade"("buyerId", "status");

-- CreateIndex
CREATE INDEX "Trade_sellerId_status_idx" ON "Trade"("sellerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funding" ADD CONSTRAINT "Funding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swap" ADD CONSTRAINT "Swap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
