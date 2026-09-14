ALTER TABLE `group_members` ADD `role` text DEFAULT 'member' NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_group_members` (
	`groupId` text NOT NULL,
	`userId` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	CONSTRAINT `fk_group_members_groupId_groups_id_fk` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_group_members_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `group_members_unique` UNIQUE(`groupId`,`userId`),
	CONSTRAINT "group_members_role_check" CHECK("role" IN ('admin', 'moderator', 'member'))
);
--> statement-breakpoint
INSERT INTO `__new_group_members`(`groupId`, `userId`) SELECT `groupId`, `userId` FROM `group_members`;--> statement-breakpoint
DROP TABLE `group_members`;--> statement-breakpoint
ALTER TABLE `__new_group_members` RENAME TO `group_members`;--> statement-breakpoint
PRAGMA foreign_keys=ON;