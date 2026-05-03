-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_authorId_fkey";

-- DropIndex
DROP INDEX "books_likes_idx";

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "isAuthorReg" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "authorId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "books_createdAt_idx" ON "books"("createdAt");

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
