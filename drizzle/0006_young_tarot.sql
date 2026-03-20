ALTER TABLE "announcements" RENAME COLUMN "description" TO "message";--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "type" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;