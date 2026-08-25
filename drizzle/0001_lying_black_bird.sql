CREATE TABLE `contribution_events` (
	`id` text PRIMARY KEY NOT NULL,
	`contribution_id` text NOT NULL,
	`action` text NOT NULL,
	`actor_label` text NOT NULL,
	`actor_email_hash` text NOT NULL,
	`from_verification` text,
	`to_verification` text,
	`from_publication` text,
	`to_publication` text,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `contribution_events_contribution_idx` ON `contribution_events` (`contribution_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `contributions` ADD `published_at` text;