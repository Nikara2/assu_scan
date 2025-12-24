-- CreateTable
CREATE TABLE "InsuranceCard" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "souscripteur" TEXT,
    "numPolice" TEXT,
    "numAssure" TEXT,
    "assure" TEXT,
    "beneficiaire" TEXT,
    "age" INTEGER,
    "sexe" TEXT,
    "rawText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceCard_pkey" PRIMARY KEY ("id")
);
