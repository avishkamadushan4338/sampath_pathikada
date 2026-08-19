-- AlterTable
ALTER TABLE `submissions` ADD COLUMN `reviewStage` ENUM('AD', 'DS') NOT NULL DEFAULT 'AD',
    MODIFY `status` ENUM('DRAFT', 'SUBMITTED', 'AD_APPROVED', 'APPROVED', 'REJECTED', 'REVISION_NEEDED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('SUPER_ADMIN', 'ADMIN', 'ECONOMIC_DEVELOPMENT_OFFICER', 'ASSISTANT_DIRECTOR_PLANNING', 'DIVISIONAL_SECRETARIAT') NOT NULL;

-- CreateTable
CREATE TABLE `assistant_director_planning_registrations` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(80) NULL,
    `lastName` VARCHAR(80) NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `nic` VARCHAR(20) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `verificationDocType` ENUM('NIC', 'DRIVING_LICENSE', 'PASSPORT') NULL,
    `verificationDocFrontPath` VARCHAR(500) NULL,
    `verificationDocBackPath` VARCHAR(500) NULL,
    `verificationDocDeletedAt` DATETIME(3) NULL,
    `district` VARCHAR(80) NOT NULL,
    `dsDivision` VARCHAR(80) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejectionNote` TEXT NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `submittedFromIp` VARCHAR(45) NULL,

    INDEX `assistant_director_planning_registrations_status_idx`(`status`),
    INDEX `assistant_director_planning_registrations_district_idx`(`district`),
    INDEX `assistant_director_planning_registrations_dsDivision_idx`(`dsDivision`),
    INDEX `assistant_director_planning_registrations_email_idx`(`email`),
    INDEX `assistant_director_planning_registrations_nic_idx`(`nic`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `submissions_reviewStage_status_idx` ON `submissions`(`reviewStage`, `status`);

-- AddForeignKey
ALTER TABLE `assistant_director_planning_registrations` ADD CONSTRAINT `assistant_director_planning_registrations_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
