ALTER TABLE "custom_model" ADD COLUMN "style" text;--> statement-breakpoint
ALTER TABLE "custom_model" ADD COLUMN "height" text;--> statement-breakpoint
ALTER TABLE "custom_model" ADD COLUMN "weight" text;--> statement-breakpoint
ALTER TABLE "custom_model" ADD COLUMN "body" text;--> statement-breakpoint
ALTER TABLE "custom_model" ADD COLUMN "selected" text DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "custom_model" ADD COLUMN "is_custom" text DEFAULT 'true';--> statement-breakpoint
UPDATE "custom_model" SET "style" = '自定义', "height" = '标准', "weight" = '标准', "body" = '标准' WHERE "style" IS NULL;--> statement-breakpoint
ALTER TABLE "custom_model" ALTER COLUMN "style" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_model" ALTER COLUMN "height" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_model" ALTER COLUMN "weight" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_model" ALTER COLUMN "body" SET NOT NULL;