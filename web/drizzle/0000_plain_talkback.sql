CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actor` varchar(320) NOT NULL,
	`action` varchar(120) NOT NULL,
	`entity` varchar(60),
	`entity_id` varchar(60),
	`before_json` json,
	`after_json` json,
	`ip` varchar(45),
	`at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token_hash` char(64) NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	`revoked_at` timestamp,
	`ip` varchar(45),
	`user_agent` varchar(255),
	CONSTRAINT `admin_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_sessions_token_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` varchar(10) NOT NULL,
	`value` varchar(320) NOT NULL,
	`failures` int NOT NULL DEFAULT 0,
	`window_started_at` timestamp NOT NULL,
	`locked_until` timestamp,
	CONSTRAINT `login_attempts_id` PRIMARY KEY(`id`),
	CONSTRAINT `login_attempts_kind_value_unique` UNIQUE(`kind`,`value`)
);
--> statement-breakpoint
CREATE INDEX `activity_log_at_idx` ON `activity_log` (`at`);--> statement-breakpoint
CREATE INDEX `admin_sessions_user_idx` ON `admin_sessions` (`user_id`);