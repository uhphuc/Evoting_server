CREATE TABLE "encrypted_votes" (
	"room_id" integer NOT NULL,
	"option_id" integer NOT NULL,
	"encrypted_data" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "encrypted_votes" ADD CONSTRAINT "encrypted_votes_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encrypted_votes" ADD CONSTRAINT "encrypted_votes_option_id_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."options"("id") ON DELETE no action ON UPDATE no action;