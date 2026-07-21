-- CreateTable
CREATE TABLE `website_content` (
    `key` VARCHAR(80) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `body` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
