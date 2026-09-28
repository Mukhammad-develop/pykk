ALTER TABLE `bookings` MODIFY COLUMN `status` varchar(20) NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `bookings` ADD `customer_name` varchar(160);--> statement-breakpoint
ALTER TABLE `bookings` ADD `customer_phone` varchar(40);--> statement-breakpoint
ALTER TABLE `bookings` ADD `service` varchar(120);--> statement-breakpoint
ALTER TABLE `bookings` ADD `note` varchar(500);--> statement-breakpoint
ALTER TABLE `bookings` ADD `ip` varchar(45);--> statement-breakpoint
CREATE INDEX `bookings_starts_idx` ON `bookings` (`starts_at`);