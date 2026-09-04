CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar(20) NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"company" varchar(200),
	"subject" varchar(200),
	"phone" varchar(60),
	"message" text,
	"consent" boolean DEFAULT false NOT NULL,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_inquiries_kind" CHECK ("inquiries"."kind" in ('contact', 'demo'))
);
--> statement-breakpoint
CREATE INDEX "ix_inquiries_created" ON "inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ix_inquiries_delivered" ON "inquiries" USING btree ("delivered_at");