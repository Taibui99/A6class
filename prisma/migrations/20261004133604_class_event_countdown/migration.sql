-- CreateTable
CREATE TABLE "ClassEvent" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassEvent_classId_isActive_idx" ON "ClassEvent"("classId", "isActive");

-- AddForeignKey
ALTER TABLE "ClassEvent" ADD CONSTRAINT "ClassEvent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
