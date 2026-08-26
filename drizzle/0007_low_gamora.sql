CREATE TABLE `analytics_daily_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`path` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_daily_pages_day_path_unique` ON `analytics_daily_pages` (`day`,`path`);--> statement-breakpoint
CREATE INDEX `analytics_daily_pages_day_idx` ON `analytics_daily_pages` (`day`);--> statement-breakpoint
CREATE TABLE `analytics_daily_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`source` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_daily_sources_day_source_unique` ON `analytics_daily_sources` (`day`,`source`);--> statement-breakpoint
CREATE INDEX `analytics_daily_sources_day_idx` ON `analytics_daily_sources` (`day`);--> statement-breakpoint
CREATE TABLE `analytics_daily_visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`device` text NOT NULL,
	`first_path` text NOT NULL,
	`source` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_daily_visitors_day_hash_unique` ON `analytics_daily_visitors` (`day`,`visitor_hash`);--> statement-breakpoint
CREATE INDEX `analytics_daily_visitors_day_idx` ON `analytics_daily_visitors` (`day`);--> statement-breakpoint
CREATE INDEX `analytics_daily_visitors_day_device_idx` ON `analytics_daily_visitors` (`day`,`device`);--> statement-breakpoint
CREATE TABLE `analytics_login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`fingerprint_hash` text NOT NULL,
	`window_start` integer NOT NULL,
	`failures` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_login_attempts_fingerprint_idx` ON `analytics_login_attempts` (`fingerprint_hash`,`window_start`);