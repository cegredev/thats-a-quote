CREATE TABLE `accounts` (
	`id` text PRIMARY KEY,
	`username` text NOT NULL UNIQUE,
	`passwordHash` text NOT NULL,
	`vault` text DEFAULT '[]' NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`passwordHash` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY,
	`groupId` text NOT NULL,
	`text` text NOT NULL,
	`person` text NOT NULL,
	`createdAt` integer NOT NULL,
	`quotedAt` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_quotes_groupId_groups_id_fk` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `idx_quotes_group` ON `quotes` (`groupId`);