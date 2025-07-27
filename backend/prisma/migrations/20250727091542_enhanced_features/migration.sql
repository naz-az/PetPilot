-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_UPDATE', 'PAYMENT_RECEIVED', 'REVIEW_RECEIVED', 'PILOT_ARRIVED', 'MESSAGE_RECEIVED', 'SYSTEM_ALERT', 'PROMOTIONAL');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "pets" ADD COLUMN     "allergies" TEXT[],
ADD COLUMN     "emergencyVet" TEXT,
ADD COLUMN     "lastVetVisit" TIMESTAMP(3),
ADD COLUMN     "medicalNotes" TEXT,
ADD COLUMN     "medications" TEXT[],
ADD COLUMN     "microchipId" TEXT,
ADD COLUMN     "nextVetVisit" TIMESTAMP(3),
ADD COLUMN     "vaccinations" JSONB,
ADD COLUMN     "vetContact" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "social_accounts" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "paymentIntent" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "refundReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "medications" TEXT[],
    "cost" DOUBLE PRECISION,
    "vetName" TEXT,
    "vetClinic" TEXT,
    "documents" TEXT[],
    "visitDate" TIMESTAMP(3) NOT NULL,
    "nextVisit" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "petId" TEXT NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vet_appointments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "vetName" TEXT NOT NULL,
    "vetClinic" TEXT NOT NULL,
    "vetPhone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "reminder" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "petId" TEXT NOT NULL,

    CONSTRAINT "vet_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_data" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "windSpeed" DOUBLE PRECISION,
    "uvIndex" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_provider_providerId_key" ON "social_accounts"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vet_appointments" ADD CONSTRAINT "vet_appointments_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
