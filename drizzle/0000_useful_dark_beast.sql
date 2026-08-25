CREATE TABLE `contribution_files` (
	`id` text PRIMARY KEY NOT NULL,
	`contribution_id` text NOT NULL,
	`r2_key` text NOT NULL,
	`original_name` text NOT NULL,
	`media_kind` text NOT NULL,
	`mime_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`sha256` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contribution_id`) REFERENCES `contributions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contribution_files_r2_key_unique` ON `contribution_files` (`r2_key`);--> statement-breakpoint
CREATE INDEX `contribution_files_contribution_idx` ON `contribution_files` (`contribution_id`);--> statement-breakpoint
CREATE INDEX `contribution_files_sha256_idx` ON `contribution_files` (`sha256`);--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`receipt_token_hash` text NOT NULL,
	`type` text NOT NULL,
	`subject` text NOT NULL,
	`server` text NOT NULL,
	`observed_at` text NOT NULL,
	`payload_json` text NOT NULL,
	`payload_hash` text NOT NULL,
	`client_token_hash` text NOT NULL,
	`source_count` integer DEFAULT 0 NOT NULL,
	`contributor_alias` text,
	`contact_private` text,
	`verification_status` text DEFAULT 'draft' NOT NULL,
	`publication_status` text DEFAULT 'queued' NOT NULL,
	`upload_status` text DEFAULT 'complete' NOT NULL,
	`moderation_note` text,
	`reviewed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contributions_receipt_hash_unique` ON `contributions` (`receipt_token_hash`);--> statement-breakpoint
CREATE INDEX `contributions_client_created_idx` ON `contributions` (`client_token_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `contributions_payload_created_idx` ON `contributions` (`payload_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `contributions_queue_idx` ON `contributions` (`publication_status`,`created_at`);