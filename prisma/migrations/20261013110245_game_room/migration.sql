-- CreateTable
CREATE TABLE "GameRoom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Ghép cặp',
    "pairs" JSONB NOT NULL DEFAULT '[]',
    "state" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameRoom_code_key" ON "GameRoom"("code");
