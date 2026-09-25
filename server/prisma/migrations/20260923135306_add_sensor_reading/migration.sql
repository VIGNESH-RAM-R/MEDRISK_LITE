-- CreateTable
CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "sensorType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "thresholdBreached" BOOLEAN NOT NULL DEFAULT false,
    "relatedFailureModeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SensorReading_workspaceId_sensorType_createdAt_idx" ON "SensorReading"("workspaceId", "sensorType", "createdAt");

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_relatedFailureModeId_fkey" FOREIGN KEY ("relatedFailureModeId") REFERENCES "FailureMode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
