CREATE TYPE "public"."user_gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'voter');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"sender_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"gid" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	CONSTRAINT "groups_gid_unique" UNIQUE("gid")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(255),
	"gender" "user_gender" DEFAULT 'other' NOT NULL,
	"birth_date" timestamp with time zone,
	"address" text,
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'voter' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_code" varchar(6) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"manager_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"closes_at" timestamp,
	CONSTRAINT "rooms_room_code_unique" UNIQUE("room_code")
);
--> statement-breakpoint
CREATE TABLE "options" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"sum" integer DEFAULT 0 NOT NULL,
	"room_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_receivers" (
	"announcement_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	CONSTRAINT "announcement_receivers_announcement_id_receiver_id_pk" PRIMARY KEY("announcement_id","receiver_id")
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"group_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "group_members_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "room_groups" (
	"room_id" integer NOT NULL,
	"group_id" integer NOT NULL,
	CONSTRAINT "room_groups_room_id_group_id_pk" PRIMARY KEY("room_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "room_members" (
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "room_members_room_id_user_id_pk" PRIMARY KEY("room_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_receivers" ADD CONSTRAINT "announcement_receivers_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_receivers" ADD CONSTRAINT "announcement_receivers_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_groups" ADD CONSTRAINT "room_groups_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_groups" ADD CONSTRAINT "room_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;