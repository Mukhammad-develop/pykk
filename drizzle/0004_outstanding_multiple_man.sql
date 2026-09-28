CREATE TABLE `client_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token_hash` char(64) NOT NULL,
	`client_user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	`revoked_at` timestamp,
	`ip` varchar(45),
	`user_agent` varchar(255),
	CONSTRAINT `client_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_sessions_token_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `client_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` text NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `client_sessions_user_idx` ON `client_sessions` (`client_user_id`);--> statement-breakpoint
CREATE INDEX `client_users_business_idx` ON `client_users` (`business_id`);