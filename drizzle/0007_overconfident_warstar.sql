ALTER TABLE "announcement_receivers" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" DROP COLUMN "is_read";