-- AlterTable
ALTER TABLE `submissions` ADD COLUMN `year` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `submissions_submittedById_year_key` ON `submissions`(`submittedById`, `year`);

-- CreateIndex
CREATE INDEX `submissions_year_idx` ON `submissions`(`year`);
