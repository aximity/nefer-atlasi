CREATE TABLE `farm_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email_hash` text NOT NULL,
	`server` text NOT NULL,
	`region` text NOT NULL,
	`route_name` text NOT NULL,
	`profession` text NOT NULL,
	`observed_at` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`node_count` integer NOT NULL,
	`booster_profile` text NOT NULL,
	`game_cost` integer DEFAULT 0 NOT NULL,
	`tl_cost_kurus` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `farm_sessions_owner_date_idx` ON `farm_sessions` (`owner_email_hash`,`observed_at`);--> statement-breakpoint
CREATE INDEX `farm_sessions_owner_region_idx` ON `farm_sessions` (`owner_email_hash`,`region`);--> statement-breakpoint
CREATE TABLE `farm_yields` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`material` text NOT NULL,
	`grade` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_game_price` integer,
	`unit_tl_kurus` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `farm_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `farm_yields_session_idx` ON `farm_yields` (`session_id`);--> statement-breakpoint
CREATE INDEX `farm_yields_material_idx` ON `farm_yields` (`material`);