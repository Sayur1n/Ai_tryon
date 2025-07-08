ALTER TABLE "outfit_room" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "outfit_room" ADD COLUMN "is_default" text DEFAULT 'false';