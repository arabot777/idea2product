ALTER TABLE "tasks" ADD COLUMN "current_request_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "external_metric_event_id" text;