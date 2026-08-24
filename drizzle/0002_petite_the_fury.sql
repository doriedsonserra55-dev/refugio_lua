CREATE TABLE `account_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','vip_monthly','vip_annual') NOT NULL DEFAULT 'free',
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `account_plans_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `garden_snapshots` ADD `helpedCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);