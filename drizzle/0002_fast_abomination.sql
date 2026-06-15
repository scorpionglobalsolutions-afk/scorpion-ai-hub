CREATE TABLE `campaignExecutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduledCampaignId` int NOT NULL,
	`campaignId` int NOT NULL,
	`clientId` int NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`leadsProcessed` int DEFAULT 0,
	`successCount` int DEFAULT 0,
	`errorCount` int DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignExecutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`clientId` int NOT NULL,
	`date` timestamp NOT NULL,
	`leadsGenerated` int DEFAULT 0,
	`leadsQualified` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`revenue` decimal(12,2) DEFAULT '0',
	`cost` decimal(12,2) DEFAULT '0',
	`roi` decimal(5,2) DEFAULT '0',
	`conversionRate` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`period` varchar(7) NOT NULL,
	`subtotal` decimal(12,2) NOT NULL,
	`tax` decimal(12,2) DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`status` enum('draft','sent','paid','overdue') NOT NULL DEFAULT 'draft',
	`dueDate` timestamp,
	`paidAt` timestamp,
	`items` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `leadMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`campaignId` int NOT NULL,
	`clientId` int NOT NULL,
	`source` varchar(100),
	`engagementScore` int DEFAULT 0,
	`emailOpens` int DEFAULT 0,
	`emailClicks` int DEFAULT 0,
	`smsOpens` int DEFAULT 0,
	`callAttempts` int DEFAULT 0,
	`appointmentBooked` boolean DEFAULT false,
	`converted` boolean DEFAULT false,
	`lastInteraction` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leadMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`frequency` enum('once','daily','weekly','monthly') NOT NULL,
	`dayOfWeek` int,
	`dayOfMonth` int,
	`time` varchar(5),
	`timezone` varchar(50) DEFAULT 'UTC',
	`isActive` boolean DEFAULT true,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usageTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`leadsGenerated` int DEFAULT 0,
	`campaignsRun` int DEFAULT 0,
	`appointmentsBooked` int DEFAULT 0,
	`contentCreated` int DEFAULT 0,
	`auditsRun` int DEFAULT 0,
	`totalCost` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usageTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` json,
	`status` enum('pending','sent','failed','retrying') NOT NULL DEFAULT 'pending',
	`retryCount` int DEFAULT 0,
	`lastAttemptAt` timestamp,
	`response` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`name` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`events` json,
	`secret` varchar(255) NOT NULL,
	`isActive` boolean DEFAULT true,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
