-- CreateTable
CREATE TABLE "click_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "referrer" TEXT,
    "urlId" TEXT NOT NULL,
    CONSTRAINT "click_events_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "urls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_urls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "uniqueClicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "customDomain" TEXT,
    "qrCodeUrl" TEXT,
    "title" TEXT,
    "tags" TEXT,
    CONSTRAINT "urls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_urls" ("clicks", "createdAt", "customDomain", "id", "originalUrl", "qrCodeUrl", "shortCode", "tags", "title", "updatedAt", "userId") SELECT "clicks", "createdAt", "customDomain", "id", "originalUrl", "qrCodeUrl", "shortCode", "tags", "title", "updatedAt", "userId" FROM "urls";
DROP TABLE "urls";
ALTER TABLE "new_urls" RENAME TO "urls";
CREATE UNIQUE INDEX "urls_shortCode_key" ON "urls"("shortCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
