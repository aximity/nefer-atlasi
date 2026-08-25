CREATE TABLE `group_announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`receipt_token_hash` text NOT NULL,
	`client_token_hash` text NOT NULL,
	`server` text NOT NULL,
	`category` text NOT NULL,
	`region` text NOT NULL,
	`title` text NOT NULL,
	`roles_json` text NOT NULL,
	`leader_alias` text NOT NULL,
	`channel` text NOT NULL,
	`start_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_announcements_receipt_unique` ON `group_announcements` (`receipt_token_hash`);--> statement-breakpoint
CREATE INDEX `group_announcements_active_start_idx` ON `group_announcements` (`status`,`start_at`);--> statement-breakpoint
CREATE INDEX `group_announcements_client_created_idx` ON `group_announcements` (`client_token_hash`,`created_at`);