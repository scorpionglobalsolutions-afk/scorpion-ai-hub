CREATE TABLE `chatAgents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`industry` varchar(100),
	`tone` enum('friendly','professional','casual','formal') DEFAULT 'friendly',
	`systemPrompt` text,
	`welcomeMessage` text,
	`faqs` json,
	`leadCaptureEnabled` boolean DEFAULT true,
	`bookingEnabled` boolean DEFAULT false,
	`status` enum('draft','active','paused') NOT NULL DEFAULT 'draft',
	`totalConversations` int DEFAULT 0,
	`totalLeadsCaptured` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatAgents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`clientId` int NOT NULL,
	`visitorName` varchar(255),
	`visitorEmail` varchar(320),
	`visitorPhone` varchar(30),
	`messages` json,
	`leadCaptured` boolean DEFAULT false,
	`outcome` enum('lead_captured','booking_made','faq_answered','abandoned','ongoing') DEFAULT 'ongoing',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gbpPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(255),
	`industry` varchar(100),
	`postType` enum('offer','update','event','product','seasonal') NOT NULL,
	`title` varchar(255),
	`content` text,
	`callToAction` varchar(100),
	`ctaUrl` varchar(500),
	`scheduledDate` timestamp,
	`status` enum('draft','scheduled','published','failed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gbpPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missedCallConfigs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`industry` varchar(100),
	`responseDelaySeconds` int NOT NULL DEFAULT 30,
	`smsTemplate` text,
	`followUpTemplate` text,
	`followUpDelayMinutes` int DEFAULT 60,
	`isActive` boolean DEFAULT true,
	`totalMissedCalls` int DEFAULT 0,
	`totalResponded` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missedCallConfigs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missedCallEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configId` int NOT NULL,
	`clientId` int NOT NULL,
	`callerPhone` varchar(30),
	`callerName` varchar(255),
	`smsSent` boolean DEFAULT false,
	`smsContent` text,
	`followUpSent` boolean DEFAULT false,
	`responded` boolean DEFAULT false,
	`outcome` enum('booked','not_interested','no_response','wrong_number','pending') DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missedCallEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preQualFunnels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` varchar(100) NOT NULL,
	`serviceType` varchar(255),
	`questions` json,
	`scoringRules` json,
	`isActive` boolean DEFAULT true,
	`totalSubmissions` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preQualFunnels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preQualSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funnelId` int NOT NULL,
	`clientId` int NOT NULL,
	`prospectName` varchar(255),
	`prospectEmail` varchar(320),
	`prospectPhone` varchar(30),
	`answers` json,
	`score` int DEFAULT 0,
	`qualification` enum('hot','warm','cold','unqualified') DEFAULT 'cold',
	`aiSummary` text,
	`status` enum('new','contacted','converted','rejected') DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preQualSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `presenceScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`overallScore` int DEFAULT 0,
	`googleRating` varchar(10),
	`reviewCount` int DEFAULT 0,
	`websiteScore` int DEFAULT 0,
	`seoScore` int DEFAULT 0,
	`socialScore` int DEFAULT 0,
	`reputationScore` int DEFAULT 0,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `presenceScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`prospectName` varchar(255) NOT NULL,
	`prospectEmail` varchar(320),
	`prospectPhone` varchar(30),
	`industry` varchar(100),
	`serviceType` varchar(255),
	`scopeOfWork` text,
	`lineItems` json,
	`subtotal` varchar(30),
	`tax` varchar(30),
	`total` varchar(30),
	`validUntil` timestamp,
	`terms` text,
	`generatedContent` text,
	`status` enum('draft','sent','accepted','declined','expired') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`rewardType` enum('discount','gift_card','cash','service_credit','custom') DEFAULT 'discount',
	`rewardValue` varchar(100),
	`referrerMessage` text,
	`refereeMessage` text,
	`channel` enum('sms','email','both') DEFAULT 'both',
	`isActive` boolean DEFAULT true,
	`totalReferrals` int DEFAULT 0,
	`totalConverted` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralTracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`clientId` int NOT NULL,
	`referrerName` varchar(255),
	`referrerPhone` varchar(30),
	`referrerEmail` varchar(320),
	`refereeName` varchar(255),
	`refereePhone` varchar(30),
	`refereeEmail` varchar(320),
	`referralCode` varchar(50),
	`status` enum('pending','contacted','converted','rewarded') DEFAULT 'pending',
	`rewardSent` boolean DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralTracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retentionEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` int NOT NULL,
	`clientId` int NOT NULL,
	`customerName` varchar(255),
	`customerPhone` varchar(30),
	`customerEmail` varchar(320),
	`lastServiceDate` timestamp,
	`generatedMessage` text,
	`sent` boolean DEFAULT false,
	`responded` boolean DEFAULT false,
	`converted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `retentionEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retentionRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` varchar(100),
	`triggerType` enum('days_since_service','days_before_renewal','anniversary','seasonal','low_engagement') NOT NULL,
	`triggerDays` int DEFAULT 90,
	`channel` enum('sms','email','both') DEFAULT 'both',
	`messageTemplate` text,
	`offerIncluded` boolean DEFAULT false,
	`offerDetails` text,
	`isActive` boolean DEFAULT true,
	`totalSent` int DEFAULT 0,
	`totalConverted` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `retentionRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviewRequestCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`industry` varchar(100),
	`googleReviewLink` varchar(500),
	`channel` enum('sms','email','both') DEFAULT 'both',
	`sendDelayHours` int DEFAULT 24,
	`smsTemplate` text,
	`emailSubjectTemplate` varchar(255),
	`emailBodyTemplate` text,
	`isActive` boolean DEFAULT true,
	`totalSent` int DEFAULT 0,
	`totalReviews` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviewRequestCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviewRequestLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`clientId` int NOT NULL,
	`customerName` varchar(255),
	`customerPhone` varchar(30),
	`customerEmail` varchar(320),
	`serviceDate` timestamp,
	`serviceType` varchar(255),
	`smsSent` boolean DEFAULT false,
	`emailSent` boolean DEFAULT false,
	`reviewLeft` boolean DEFAULT false,
	`reviewRating` int,
	`status` enum('pending','sent','reviewed','no_response') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviewRequestLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seasonalCampaignItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`clientId` int NOT NULL,
	`month` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`offerIdea` text,
	`channels` json,
	`estimatedBudget` varchar(50),
	`priority` enum('high','medium','low') DEFAULT 'medium',
	`status` enum('planned','in_progress','completed','skipped') DEFAULT 'planned',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seasonalCampaignItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seasonalPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` varchar(100) NOT NULL,
	`location` varchar(255),
	`year` int NOT NULL,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seasonalPlans_id` PRIMARY KEY(`id`)
);
