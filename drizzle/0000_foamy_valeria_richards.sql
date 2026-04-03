CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_type` text NOT NULL,
	`owner_id` text NOT NULL,
	`service` text DEFAULT 'resend' NOT NULL,
	`encrypted_key` text NOT NULL,
	`iv` text NOT NULL,
	`salt` text NOT NULL,
	`hash_digest` text NOT NULL,
	`label` text,
	`is_active` integer DEFAULT true NOT NULL,
	`deleted_at` text,
	`deleted_by` text,
	`anonymized_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`who` text NOT NULL,
	`what_table` text NOT NULL,
	`what_record_id` text,
	`how` text NOT NULL,
	`why` text NOT NULL,
	`when` text DEFAULT (datetime('now')) NOT NULL,
	`where_ip` text,
	`how_many_affected` integer DEFAULT 1,
	`organization_id` text,
	`where_organization` text,
	`hash_digest` text NOT NULL,
	FOREIGN KEY (`who`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_log_who_idx` ON `audit_log` (`who`);--> statement-breakpoint
CREATE INDEX `audit_log_where_ip_idx` ON `audit_log` (`where_ip`);--> statement-breakpoint
CREATE INDEX `audit_log_when_idx` ON `audit_log` (`when`);--> statement-breakpoint
CREATE INDEX `audit_log_org_when_idx` ON `audit_log` (`organization_id`,`when`);--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`organization_id` text NOT NULL,
	`invited_by` text NOT NULL,
	`expires_at` text NOT NULL,
	`accepted_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_token_unique` ON `invitations` (`token`);--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`role` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_by` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`expires_at` text NOT NULL,
	`accepted_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_token_unique` ON `links` (`token`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`brand_name` text,
	`logo_url` text,
	`primary_color` text DEFAULT '#324acb',
	`is_active` integer DEFAULT true NOT NULL,
	`deleted_at` text,
	`deleted_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`organization_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`last_login_at` text,
	`deleted_at` text,
	`deleted_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);