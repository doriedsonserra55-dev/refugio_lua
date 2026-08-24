CREATE TABLE `garden_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileJson` text,
	`journalJson` text NOT NULL,
	`energyCount` int NOT NULL DEFAULT 0,
	`adviceCount` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `garden_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `garden_snapshots_userId_unique` UNIQUE(`userId`)
);
