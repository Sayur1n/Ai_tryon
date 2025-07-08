CREATE TABLE "outfit_room" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model_image_url" text,
	"top_image_url" text,
	"bottom_image_url" text,
	"model_image_link" text,
	"top_image_link" text,
	"bottom_image_link" text,
	"description" text,
	"sex" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outfit_room" ADD CONSTRAINT "outfit_room_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;