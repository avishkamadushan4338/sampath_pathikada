-- CreateTable
CREATE TABLE `division_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `district` VARCHAR(80) NOT NULL,
    `dsDivision` VARCHAR(80) NOT NULL,
    `gnDivision` VARCHAR(80) NOT NULL,
    `data` JSON NOT NULL,
    `sourceSubmissionId` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `approvedById` VARCHAR(191) NOT NULL,
    `approvedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `division_profiles_gnDivision_key`(`gnDivision`),
    UNIQUE INDEX `division_profiles_sourceSubmissionId_key`(`sourceSubmissionId`),
    INDEX `division_profiles_district_idx`(`district`),
    INDEX `division_profiles_dsDivision_idx`(`dsDivision`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `division_profiles` ADD CONSTRAINT `division_profiles_sourceSubmissionId_fkey` FOREIGN KEY (`sourceSubmissionId`) REFERENCES `submissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `division_profiles` ADD CONSTRAINT `division_profiles_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
