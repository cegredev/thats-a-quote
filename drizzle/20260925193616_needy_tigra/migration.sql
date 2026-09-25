PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_quotes` (
	`id` text PRIMARY KEY,
	`groupId` text NOT NULL,
	`text` text NOT NULL,
	`person` text,
	`context` text,
	`createdAt` integer NOT NULL,
	`quotedAt` integer NOT NULL,
	CONSTRAINT `fk_quotes_groupId_groups_id_fk` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_quotes`(`id`, `groupId`, `text`, `person`, `context`, `createdAt`, `quotedAt`) SELECT `id`, `groupId`, `text`, `person`, `context`, `createdAt`, `quotedAt` FROM `quotes`;--> statement-breakpoint
DROP TABLE `quotes`;--> statement-breakpoint
ALTER TABLE `__new_quotes` RENAME TO `quotes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_quotes_group` ON `quotes` (`groupId`);