-- CreateTable
CREATE TABLE "InsuranceCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "souscripteur" TEXT,
    "numPolice" TEXT,
    "numAssure" TEXT,
    "assure" TEXT,
    "beneficiaire" TEXT,
    "age" INTEGER,
    "sexe" TEXT,
    "rawText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
