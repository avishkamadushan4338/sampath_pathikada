-- Baseline migration: these columns already exist on the live database (applied
-- previously outside the migration history, e.g. via `prisma db push` during early
-- development). This file documents them for fresh-database migrations and is
-- marked applied via `prisma migrate resolve --applied` on databases that already
-- have them, without re-running the SQL.
-- AlterTable
ALTER TABLE `users` ADD COLUMN `localGovt` VARCHAR(200) NULL,
    ADD COLUMN `electoral` VARCHAR(200) NULL,
    ADD COLUMN `farmers` VARCHAR(200) NULL,
    ADD COLUMN `eduZone` VARCHAR(200) NULL,
    ADD COLUMN `eduDiv` VARCHAR(200) NULL,
    ADD COLUMN `mahaweli` VARCHAR(200) NULL;
