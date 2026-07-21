-- 1. Widen the users.role enum to include the new value alongside the old one
ALTER TABLE `users`
  MODIFY COLUMN `role` ENUM('SUPER_ADMIN','ADMIN','ECONOMIC_DEVELOPMENT_OFFICER','REGIONAL_SECRETARY','DIVISIONAL_SECRETARIAT') NOT NULL;

-- 2. Migrate any existing rows (defensive; expected to affect 0 rows)
UPDATE `users` SET `role` = 'DIVISIONAL_SECRETARIAT' WHERE `role` = 'REGIONAL_SECRETARY';

-- 3. Narrow the enum, dropping the old value
ALTER TABLE `users`
  MODIFY COLUMN `role` ENUM('SUPER_ADMIN','ADMIN','ECONOMIC_DEVELOPMENT_OFFICER','DIVISIONAL_SECRETARIAT') NOT NULL;

-- 4. Rename the registration table
RENAME TABLE `regional_secretary_registrations` TO `divisional_secretariat_registrations`;

-- 5. Rename indexes to match the new table name
--    MariaDB 10.4 has no RENAME INDEX (added in 10.5.2) — drop and re-add instead.
ALTER TABLE `divisional_secretariat_registrations` DROP INDEX `regional_secretary_registrations_status_idx`;
ALTER TABLE `divisional_secretariat_registrations` ADD INDEX `divisional_secretariat_registrations_status_idx` (`status`);

ALTER TABLE `divisional_secretariat_registrations` DROP INDEX `regional_secretary_registrations_district_idx`;
ALTER TABLE `divisional_secretariat_registrations` ADD INDEX `divisional_secretariat_registrations_district_idx` (`district`);

ALTER TABLE `divisional_secretariat_registrations` DROP INDEX `regional_secretary_registrations_dsDivision_idx`;
ALTER TABLE `divisional_secretariat_registrations` ADD INDEX `divisional_secretariat_registrations_dsDivision_idx` (`dsDivision`);

ALTER TABLE `divisional_secretariat_registrations` DROP INDEX `regional_secretary_registrations_email_idx`;
ALTER TABLE `divisional_secretariat_registrations` ADD INDEX `divisional_secretariat_registrations_email_idx` (`email`);

ALTER TABLE `divisional_secretariat_registrations` DROP INDEX `regional_secretary_registrations_nic_idx`;
ALTER TABLE `divisional_secretariat_registrations` ADD INDEX `divisional_secretariat_registrations_nic_idx` (`nic`);

-- 6. Rename the FK constraint (drop + re-add; MariaDB has no RENAME CONSTRAINT).
--    Dropping the FK also drops its auto-created index, so re-add both together.
ALTER TABLE `divisional_secretariat_registrations` DROP FOREIGN KEY `regional_secretary_registrations_approvedById_fkey`;
ALTER TABLE `divisional_secretariat_registrations` DROP INDEX `regional_secretary_registrations_approvedById_fkey`;
ALTER TABLE `divisional_secretariat_registrations` ADD CONSTRAINT `divisional_secretariat_registrations_approvedById_fkey`
  FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
