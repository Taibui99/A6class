-- CreateEnum
CREATE TYPE "CriterionKind" AS ENUM ('POSITIVE', 'NEGATIVE');

-- AlterTable
ALTER TABLE "CompetitionPeriod" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PointTransaction" ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "criterionId" TEXT;

-- CreateTable
CREATE TABLE "Criterion" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "CriterionKind" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Criterion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Criterion_classId_key_key" ON "Criterion"("classId", "key");

-- CreateIndex
CREATE INDEX "PointTransaction_classId_periodId_idx" ON "PointTransaction"("classId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "PointTransaction_periodId_criterionId_targetUserId_key" ON "PointTransaction"("periodId", "criterionId", "targetUserId");

-- AddForeignKey
ALTER TABLE "Criterion" ADD CONSTRAINT "Criterion_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion"("id") ON DELETE SET NULL ON UPDATE CASCADE;