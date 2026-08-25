CREATE TABLE `farm_route_points` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`point_type` text NOT NULL,
	`label` text NOT NULL,
	`material_hint` text,
	`x_permille` integer NOT NULL,
	`y_permille` integer NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `farm_route_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `farm_route_points_template_order_idx` ON `farm_route_points` (`template_id`,`order_index`);--> statement-breakpoint
CREATE TABLE `farm_route_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email_hash` text NOT NULL,
	`server` text NOT NULL,
	`region` text NOT NULL,
	`route_name` text NOT NULL,
	`profession` text NOT NULL,
	`default_booster` text NOT NULL,
	`expected_minutes` integer NOT NULL,
	`notes` text,
	`map_r2_key` text,
	`map_mime_type` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `farm_route_templates_owner_region_idx` ON `farm_route_templates` (`owner_email_hash`,`region`);--> statement-breakpoint
CREATE INDEX `farm_route_templates_owner_status_idx` ON `farm_route_templates` (`owner_email_hash`,`status`);--> statement-breakpoint
ALTER TABLE `farm_sessions` ADD `route_template_id` text REFERENCES farm_route_templates(id);--> statement-breakpoint
ALTER TABLE `farm_sessions` ADD `submitted_contribution_id` text REFERENCES contributions(id);