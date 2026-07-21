-- AlterTable
ALTER TABLE `economic_development_officer_registrations` ADD COLUMN `verificationDocBackPath` VARCHAR(500) NULL,
    ADD COLUMN `verificationDocDeletedAt` DATETIME(3) NULL,
    ADD COLUMN `verificationDocFrontPath` VARCHAR(500) NULL,
    ADD COLUMN `verificationDocType` ENUM('NIC', 'DRIVING_LICENSE', 'PASSPORT') NULL;

-- AlterTable
ALTER TABLE `regional_secretary_registrations` ADD COLUMN `verificationDocBackPath` VARCHAR(500) NULL,
    ADD COLUMN `verificationDocDeletedAt` DATETIME(3) NULL,
    ADD COLUMN `verificationDocFrontPath` VARCHAR(500) NULL,
    ADD COLUMN `verificationDocType` ENUM('NIC', 'DRIVING_LICENSE', 'PASSPORT') NULL;
