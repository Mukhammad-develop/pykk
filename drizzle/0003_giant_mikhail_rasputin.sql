ALTER TABLE `businesses` ADD `intake_json` json;--> statement-breakpoint
ALTER TABLE `businesses` ADD `website_status` varchar(20) DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `businesses` ADD `website_built_at` timestamp;--> statement-breakpoint
ALTER TABLE `businesses` ADD `website_note` varchar(255);