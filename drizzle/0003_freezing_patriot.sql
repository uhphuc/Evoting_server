CREATE TABLE "room_approvers" (
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "room_approvers_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "room_approvers" ADD CONSTRAINT "room_approvers_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_approvers" ADD CONSTRAINT "room_approvers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;