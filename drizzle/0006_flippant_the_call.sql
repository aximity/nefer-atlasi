CREATE TABLE `guild_logistics_boards` (
	`id` text PRIMARY KEY NOT NULL,
	`public_code` text NOT NULL,
	`manager_token_hash` text NOT NULL,
	`client_token_hash` text NOT NULL,
	`guild_name` text NOT NULL,
	`server` text NOT NULL,
	`week_start` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guild_logistics_boards_public_code_unique` ON `guild_logistics_boards` (`public_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `guild_logistics_boards_manager_hash_unique` ON `guild_logistics_boards` (`manager_token_hash`);--> statement-breakpoint
CREATE INDEX `guild_logistics_boards_client_created_idx` ON `guild_logistics_boards` (`client_token_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `guild_logistics_boosters` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`title` text NOT NULL,
	`scope` text NOT NULL,
	`quantity` integer NOT NULL,
	`status` text DEFAULT 'Planlandı' NOT NULL,
	`sponsor_alias` text,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `guild_logistics_boards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `guild_logistics_boosters_board_status_idx` ON `guild_logistics_boosters` (`board_id`,`status`);--> statement-breakpoint
CREATE TABLE `guild_logistics_contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`goal_id` text NOT NULL,
	`receipt_token_hash` text NOT NULL,
	`client_token_hash` text NOT NULL,
	`contributor_alias` text NOT NULL,
	`amount` integer NOT NULL,
	`note` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `guild_logistics_boards`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`goal_id`) REFERENCES `guild_logistics_goals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guild_logistics_contributions_receipt_unique` ON `guild_logistics_contributions` (`receipt_token_hash`);--> statement-breakpoint
CREATE INDEX `guild_logistics_contributions_goal_idx` ON `guild_logistics_contributions` (`goal_id`,`status`);--> statement-breakpoint
CREATE INDEX `guild_logistics_contributions_client_created_idx` ON `guild_logistics_contributions` (`client_token_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `guild_logistics_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`game_amount` integer NOT NULL,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `guild_logistics_boards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `guild_logistics_expenses_board_idx` ON `guild_logistics_expenses` (`board_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `guild_logistics_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`target_amount` integer NOT NULL,
	`unit` text NOT NULL,
	`assigned_role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `guild_logistics_boards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `guild_logistics_goals_board_order_idx` ON `guild_logistics_goals` (`board_id`,`order_index`);