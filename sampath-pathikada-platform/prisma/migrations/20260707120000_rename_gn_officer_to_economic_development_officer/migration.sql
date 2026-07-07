-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `nameSinhala` VARCHAR(120) NULL,
    `phone` VARCHAR(20) NULL,
    `nic` VARCHAR(20) NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'ECONOMIC_DEVELOPMENT_OFFICER', 'REGIONAL_SECRETARY') NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `district` VARCHAR(80) NULL,
    `dsDivision` VARCHAR(80) NULL,
    `gnDivision` VARCHAR(80) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `lastLoginIp` VARCHAR(45) NULL,
    `loginAttempts` INTEGER NOT NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,
    `mustResetPassword` BOOLEAN NOT NULL DEFAULT false,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_nic_key`(`nic`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_district_idx`(`district`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `economic_development_officer_registrations` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(80) NULL,
    `lastName` VARCHAR(80) NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `nic` VARCHAR(20) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `district` VARCHAR(80) NOT NULL,
    `dsDivision` VARCHAR(80) NOT NULL,
    `gnDivision` VARCHAR(80) NOT NULL,
    `localGovt` VARCHAR(200) NULL,
    `electoral` VARCHAR(200) NULL,
    `farmers` VARCHAR(200) NULL,
    `eduZone` VARCHAR(200) NULL,
    `eduDiv` VARCHAR(200) NULL,
    `mahaweli` VARCHAR(200) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejectionNote` TEXT NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `submittedFromIp` VARCHAR(45) NULL,

    INDEX `economic_development_officer_registrations_status_idx`(`status`),
    INDEX `economic_development_officer_registrations_district_idx`(`district`),
    INDEX `economic_development_officer_registrations_dsDivision_idx`(`dsDivision`),
    INDEX `economic_development_officer_registrations_gnDivision_idx`(`gnDivision`),
    INDEX `economic_development_officer_registrations_email_idx`(`email`),
    INDEX `economic_development_officer_registrations_nic_idx`(`nic`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regional_secretary_registrations` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(80) NULL,
    `lastName` VARCHAR(80) NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `nic` VARCHAR(20) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `district` VARCHAR(80) NOT NULL,
    `dsDivision` VARCHAR(80) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejectionNote` TEXT NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedById` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `submittedFromIp` VARCHAR(45) NULL,

    INDEX `regional_secretary_registrations_status_idx`(`status`),
    INDEX `regional_secretary_registrations_district_idx`(`district`),
    INDEX `regional_secretary_registrations_dsDivision_idx`(`dsDivision`),
    INDEX `regional_secretary_registrations_email_idx`(`email`),
    INDEX `regional_secretary_registrations_nic_idx`(`nic`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(120) NOT NULL,
    `description` TEXT NOT NULL,
    `category` ENUM('AUTH', 'USER', 'ADMIN', 'SYSTEM', 'DATA', 'REGISTRATION') NOT NULL,
    `severity` ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS') NOT NULL DEFAULT 'INFO',
    `userId` VARCHAR(191) NULL,
    `userName` VARCHAR(120) NOT NULL,
    `userIp` VARCHAR(45) NULL,
    `userAgent` VARCHAR(500) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_category_idx`(`category`),
    INDEX `audit_logs_severity_idx`(`severity`),
    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_invites` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `tempPassword` VARCHAR(255) NOT NULL,
    `districts` JSON NULL,
    `invitedById` VARCHAR(191) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_invites_email_key`(`email`),
    INDEX `admin_invites_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submissions` (
    `id` VARCHAR(191) NOT NULL,
    `submittedById` VARCHAR(191) NOT NULL,
    `district` VARCHAR(80) NOT NULL,
    `dsDivision` VARCHAR(80) NOT NULL,
    `gnDivision` VARCHAR(80) NOT NULL,
    `data` JSON NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION_NEEDED') NOT NULL DEFAULT 'DRAFT',
    `rejectionNote` TEXT NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `submissions_submittedById_idx`(`submittedById`),
    INDEX `submissions_status_idx`(`status`),
    INDEX `submissions_district_idx`(`district`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `key` VARCHAR(80) NOT NULL,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `economic_development_officer_registrations` ADD CONSTRAINT `economic_development_officer_registrations_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regional_secretary_registrations` ADD CONSTRAINT `regional_secretary_registrations_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

