-- Sessions gain a CSRF token.
--
-- Existing rows are deleted rather than backfilled, on purpose. A session
-- created before this column existed has no token, so it could never satisfy
-- the CSRF check — and a backfilled placeholder would be a token the client
-- never received. Everyone signs in again; sessions are cheap.
--
-- This also makes the ADD COLUMN ... NOT NULL safe: without the delete it
-- fails outright on any table that has rows.
DELETE FROM "sessions";--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "csrf_token" varchar(64) NOT NULL;
