/*
  Warnings:

  - You are about to drop the column `invite` on the `users` table. All the data in the column will be lost.
  - Added the required column `nickname` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "invite",
ADD COLUMN     "nickname" VARCHAR(64) NOT NULL;
