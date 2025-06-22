ALTER TYPE "public"."task_result_type" ADD VALUE 'file';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'transfering' BEFORE 'completed';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "task_results" ALTER COLUMN "type" SET DATA TYPE text;