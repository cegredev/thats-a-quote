CREATE TABLE `group_members` (
	`groupId` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_group_members_groupId_groups_id_fk` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_group_members_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `group_members_unique` UNIQUE(`groupId`,`userId`)
);
