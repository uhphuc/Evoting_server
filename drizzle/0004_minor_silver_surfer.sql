DROP TABLE "room_approvers" CASCADE;--> statement-breakpoint
ALTER TABLE "room_members" ADD COLUMN "is_approved" boolean DEFAULT false NOT NULL;