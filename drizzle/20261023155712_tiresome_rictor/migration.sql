CREATE TABLE `comment_reactions` (
	`id` text PRIMARY KEY,
	`comment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_comment_reactions_comment_id_quote_comments_id_fk` FOREIGN KEY (`comment_id`) REFERENCES `quote_comments`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comment_reactions_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `quote_comments` (
	`id` text PRIMARY KEY,
	`quote_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_quote_comments_quote_id_quotes_id_fk` FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_quote_comments_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `quote_reactions` (
	`id` text PRIMARY KEY,
	`quote_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_quote_reactions_quote_id_quotes_id_fk` FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_quote_reactions_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comment_reactions_user_comment_uq` ON `comment_reactions` (`user_id`,`comment_id`);--> statement-breakpoint
CREATE INDEX `comment_reactions_comment_id_idx` ON `comment_reactions` (`comment_id`);--> statement-breakpoint
CREATE INDEX `comments_quote_id_idx` ON `quote_comments` (`quote_id`);--> statement-breakpoint
CREATE INDEX `comments_user_id_idx` ON `quote_comments` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `quote_reactions_user_quote_uq` ON `quote_reactions` (`user_id`,`quote_id`);--> statement-breakpoint
CREATE INDEX `quote_reactions_quote_id_idx` ON `quote_reactions` (`quote_id`);