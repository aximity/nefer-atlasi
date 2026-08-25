CREATE TABLE `canonical_records` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_key` text NOT NULL,
	`display_name` text NOT NULL,
	`data_json` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`source_contribution_id` text,
	`updated_by_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`source_contribution_id`) REFERENCES `contributions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `canonical_records_type_key_unique` ON `canonical_records` (`entity_type`,`entity_key`);--> statement-breakpoint
CREATE INDEX `canonical_records_public_idx` ON `canonical_records` (`active`,`entity_type`);--> statement-breakpoint
CREATE TABLE `canonical_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`contribution_id` text,
	`action` text NOT NULL,
	`version` integer NOT NULL,
	`previous_data_json` text,
	`next_data_json` text,
	`previous_active` integer NOT NULL,
	`next_active` integer NOT NULL,
	`actor_label` text NOT NULL,
	`actor_email_hash` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`record_id`) REFERENCES `canonical_records`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `canonical_revisions_record_idx` ON `canonical_revisions` (`record_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `canonical_revisions_contribution_idx` ON `canonical_revisions` (`contribution_id`,`created_at`);