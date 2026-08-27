CREATE TABLE `analytics_daily_engagement` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`path` text NOT NULL,
	`engaged_seconds` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_daily_engagement_day_path_unique` ON `analytics_daily_engagement` (`day`,`path`);--> statement-breakpoint
CREATE INDEX `analytics_daily_engagement_day_idx` ON `analytics_daily_engagement` (`day`);