CREATE TABLE "scan_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"company" varchar(200) NOT NULL,
	"position" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ix_scan_leads_created" ON "scan_leads" USING btree ("created_at");