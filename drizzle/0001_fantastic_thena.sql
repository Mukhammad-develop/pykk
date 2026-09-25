CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`starts_at` timestamp NOT NULL,
	`status` varchar(20) NOT NULL,
	`source` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(40) NOT NULL,
	`type` varchar(30) NOT NULL,
	`owner_name` varchar(160),
	`owner_email` varchar(320),
	`owner_phone` varchar(40),
	`address` varchar(255),
	`postcode` varchar(12),
	`town` varchar(120),
	`status` varchar(20) NOT NULL DEFAULT 'lead',
	`price_pence` int NOT NULL,
	`billing_anchor_date` date,
	`started_at` date,
	`cancelled_at` date,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` char(7) NOT NULL,
	`category` varchar(20) NOT NULL,
	`amount_pence` int NOT NULL,
	`note` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `costs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_views_daily` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`day` date NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	`unique_visitors` int NOT NULL DEFAULT 0,
	CONSTRAINT `page_views_daily_id` PRIMARY KEY(`id`),
	CONSTRAINT `page_views_business_day_unique` UNIQUE(`business_id`,`day`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`reference` char(6) NOT NULL,
	`period_start` date NOT NULL,
	`period_end` date NOT NULL,
	`due_date` date NOT NULL,
	`amount_pence` int NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'scheduled',
	`payment_link_url` varchar(500),
	`link_added_at` timestamp,
	`client_token` varchar(64) NOT NULL,
	`paid_at` date,
	`paid_method` varchar(20),
	`paid_note` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_reference_unique` UNIQUE(`reference`),
	CONSTRAINT `payments_business_period_unique` UNIQUE(`business_id`,`period_start`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(60) NOT NULL,
	`value` text NOT NULL,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `sms_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`kind` varchar(40) NOT NULL,
	`status` varchar(20) NOT NULL,
	`segments` int,
	`cost_pence` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sms_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `bookings_business_idx` ON `bookings` (`business_id`);--> statement-breakpoint
CREATE INDEX `businesses_status_idx` ON `businesses` (`status`);--> statement-breakpoint
CREATE INDEX `costs_month_idx` ON `costs` (`month`);--> statement-breakpoint
CREATE INDEX `enquiries_business_idx` ON `enquiries` (`business_id`);--> statement-breakpoint
CREATE INDEX `payments_status_due_idx` ON `payments` (`status`,`due_date`);--> statement-breakpoint
CREATE INDEX `payments_business_idx` ON `payments` (`business_id`);--> statement-breakpoint
CREATE INDEX `sms_business_idx` ON `sms_messages` (`business_id`);