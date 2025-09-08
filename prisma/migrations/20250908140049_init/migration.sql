-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "assets_type" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "size" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "screenshot_count" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "qq" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "introduction" TEXT NOT NULL DEFAULT '',
    "has_avatar" BOOLEAN NOT NULL DEFAULT false,
    "contacts" TEXT NOT NULL DEFAULT '',
    "hash" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hide" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "configuration" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_GameToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GameToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GameToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GameToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GameToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "game_title_key" ON "game"("title");

-- CreateIndex
CREATE UNIQUE INDEX "user_qq_key" ON "user"("qq");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "configuration_key_key" ON "configuration"("key");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToTag_AB_unique" ON "_GameToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToTag_B_index" ON "_GameToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToUser_AB_unique" ON "_GameToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToUser_B_index" ON "_GameToUser"("B");

-- CreatePartialIndex
CREATE INDEX "game_created_at_idx" ON "game"("created_at") WHERE is_private=false;
