CREATE TABLE "post_slugs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"slug" varchar(140) NOT NULL,
	"locale" varchar(5) DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_post_slugs_slug_shape" CHECK ("post_slugs"."slug" ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$')
);
--> statement-breakpoint
ALTER TABLE "post_slugs" ADD CONSTRAINT "post_slugs_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_post_slugs_slug_locale" ON "post_slugs" USING btree ("slug","locale");--> statement-breakpoint
CREATE INDEX "ix_post_slugs_post" ON "post_slugs" USING btree ("post_id");