CREATE TABLE "scan_access_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "scan_access_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar(16) NOT NULL,
	"status" varchar(32) DEFAULT 'queued' NOT NULL,
	"locale" varchar(5) DEFAULT 'en' NOT NULL,
	"subject_cipher" text NOT NULL,
	"subject_digest" varchar(64) NOT NULL,
	"result_cipher" text,
	"risk_band" varchar(16),
	"verified_at" timestamp with time zone,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"failure_code" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scan_access_tokens" ADD CONSTRAINT "scan_access_tokens_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_scan_tokens_scan" ON "scan_access_tokens" USING btree ("scan_id");--> statement-breakpoint
CREATE INDEX "ix_scans_digest_created" ON "scans" USING btree ("subject_digest","created_at");--> statement-breakpoint
CREATE INDEX "ix_scans_expires" ON "scans" USING btree ("expires_at");