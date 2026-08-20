-- AlterTable
ALTER TABLE `password_reset_otps`
    ADD COLUMN `resetTokenJti` VARCHAR(36) NULL,
    ADD COLUMN `resetTokenUsedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `password_reset_otps_resetTokenJti_key` ON `password_reset_otps`(`resetTokenJti`);
