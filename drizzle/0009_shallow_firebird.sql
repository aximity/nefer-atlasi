CREATE TABLE `mine_observation_events` (
	`event_id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`observation_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`region_id` text,
	`resource_id` text,
	`x` real,
	`y` real,
	`precision` text,
	`signal` text,
	`occurred_at` text NOT NULL,
	`expires_at` text,
	`visibility_policy` text,
	`idempotency_key` text NOT NULL,
	CONSTRAINT "mine_observation_event_shape" CHECK(
    ("mine_observation_events"."kind" = 'mine_observation_reported'
      AND "mine_observation_events"."region_id" IS NOT NULL AND "mine_observation_events"."resource_id" IS NOT NULL
      AND "mine_observation_events"."x" BETWEEN 0 AND 1 AND "mine_observation_events"."y" BETWEEN 0 AND 1
      AND "mine_observation_events"."precision" = 'approximate' AND "mine_observation_events"."signal" IS NULL
      AND "mine_observation_events"."expires_at" IS NOT NULL AND "mine_observation_events"."visibility_policy" = 'caller_supplied_ttl')
    OR
    ("mine_observation_events"."kind" = 'mine_observation_signaled'
      AND "mine_observation_events"."region_id" IS NULL AND "mine_observation_events"."resource_id" IS NULL
      AND "mine_observation_events"."x" IS NULL AND "mine_observation_events"."y" IS NULL AND "mine_observation_events"."precision" IS NULL
      AND "mine_observation_events"."signal" IN ('confirm', 'reject')
      AND "mine_observation_events"."expires_at" IS NULL AND "mine_observation_events"."visibility_policy" IS NULL)
  )
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mine_observation_events_idempotency_unique` ON `mine_observation_events` (`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `mine_observation_report_unique` ON `mine_observation_events` (`observation_id`) WHERE "mine_observation_events"."kind" = 'mine_observation_reported';--> statement-breakpoint
CREATE UNIQUE INDEX `mine_observation_signal_actor_unique` ON `mine_observation_events` (`observation_id`,`actor_id`) WHERE "mine_observation_events"."kind" = 'mine_observation_signaled';--> statement-breakpoint
CREATE INDEX `mine_observation_events_observation_idx` ON `mine_observation_events` (`observation_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `mine_observation_events_live_idx` ON `mine_observation_events` (`kind`,`expires_at`);--> statement-breakpoint
CREATE INDEX `mine_observation_events_actor_rate_idx` ON `mine_observation_events` (`actor_id`,`occurred_at`);--> statement-breakpoint
CREATE TRIGGER `mine_observation_write_rate_limit`
BEFORE INSERT ON `mine_observation_events`
WHEN (
	SELECT COUNT(*)
	FROM `mine_observation_events`
	WHERE `actor_id` = NEW.`actor_id`
		AND unixepoch(`occurred_at`) >= unixepoch(NEW.`occurred_at`) - 300
		AND unixepoch(`occurred_at`) <= unixepoch(NEW.`occurred_at`)
) >= 6
BEGIN
	SELECT RAISE(ABORT, 'mine observation rate limit exceeded');
END;
