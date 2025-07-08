CREATE TABLE "outfit_result" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"person_image_url" text NOT NULL,
	"top_garment_url" text,
	"bottom_garment_url" text,
	"result_image_url" text,
	"task_id" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outfit_result" ADD CONSTRAINT "outfit_result_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;