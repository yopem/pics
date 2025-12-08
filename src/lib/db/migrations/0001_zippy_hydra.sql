CREATE TABLE "custom_templates" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"platform" text NOT NULL,
	"width" json NOT NULL,
	"height" json NOT NULL,
	"safe_zone" json,
	"thumbnail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_edited_by" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_edited_at" timestamp;--> statement-breakpoint
CREATE INDEX "custom_templates_user_id_idx" ON "custom_templates" USING btree ("user_id");