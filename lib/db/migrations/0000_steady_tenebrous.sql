CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."billing_status" AS ENUM('pending', 'active', 'pending_inactive', 'canceled', 'expired', 'paused', 'incomplete', 'processing', 'failed');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('usd', 'cny', 'eur');--> statement-breakpoint
CREATE TYPE "public"."role_type" AS ENUM('user', 'team_user', 'team_admin', 'system_admin');--> statement-breakpoint
CREATE TYPE "public"."active_status" AS ENUM('inactive', 'active', 'active_2fa');--> statement-breakpoint
CREATE TYPE "public"."auth_status" AS ENUM('anonymous', 'authenticated');--> statement-breakpoint
CREATE TYPE "public"."permission_scope" AS ENUM('page', 'api', 'action', 'component');--> statement-breakpoint
CREATE TYPE "public"."reject_action" AS ENUM('hide', 'disable', 'redirect', 'throw');--> statement-breakpoint
CREATE TYPE "public"."task_result_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected', 'rejected_nsfw');--> statement-breakpoint
CREATE TYPE "public"."task_result_type" AS ENUM('text', 'image', 'video', 'audio', '3d');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"roles" text[] DEFAULT '{}' NOT NULL,
	"username" varchar(50),
	"full_name" varchar(100),
	"avatar_url" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"active_2fa" boolean DEFAULT false NOT NULL,
	"subscription" text[] DEFAULT '{}' NOT NULL,
	"unibee_external_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "profiles_email_unique" UNIQUE("email"),
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" double precision NOT NULL,
	"currency" text NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"billing_count" integer DEFAULT 1 NOT NULL,
	"billing_type" integer DEFAULT 1 NOT NULL,
	"external_id" text DEFAULT '' NOT NULL,
	"external_checkout_url" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" double precision NOT NULL,
	"status" text NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"ended_at" timestamp,
	"currency" text NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"billing_count" integer DEFAULT 1 NOT NULL,
	"billing_type" integer DEFAULT 1 NOT NULL,
	"external_id" text,
	"external_checkout_url" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"external_id" text,
	"associated_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" double precision NOT NULL,
	"currency" "currency" DEFAULT 'usd' NOT NULL,
	"status" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role_type" "role_type" DEFAULT 'user' NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "permission_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"target" text NOT NULL,
	"scope" "permission_scope" NOT NULL,
	"auth_status" "auth_status" DEFAULT 'anonymous' NOT NULL,
	"active_status" "active_status" DEFAULT 'inactive' NOT NULL,
	"subscription_types" text[] DEFAULT '{}' NOT NULL,
	"reject_action" "reject_action" DEFAULT 'redirect' NOT NULL,
	"title" text,
	"description" text,
	CONSTRAINT "permission_configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_task_id" uuid,
	"type" text NOT NULL,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"title" text,
	"description" text,
	"progress" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"checked_at" timestamp,
	"check_interval" integer DEFAULT 5 NOT NULL,
	"message" text,
	"current_request_amount" integer DEFAULT 0 NOT NULL,
	"external_id" text,
	"external_metric_event_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"input_data" text,
	"output_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "task_data_task_id_unique" UNIQUE("task_id")
);
--> statement-breakpoint
CREATE TABLE "task_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"parent_task_id" uuid,
	"type" "task_result_type" NOT NULL,
	"status" "task_result_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"content" text,
	"storage_url" text,
	"mime_type" text,
	"width" text,
	"height" text,
	"duration" text,
	"file_mime_type" text,
	"file_size" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billable_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unibee_external_id" text,
	"code" text NOT NULL,
	"metric_name" text NOT NULL,
	"metric_description" text,
	"aggregation_property" text,
	"aggregation_type" integer NOT NULL,
	"type" integer NOT NULL,
	"feature_calculator" text NOT NULL,
	"feature_once_max" double precision,
	"display_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_metric_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"metric_name" text NOT NULL,
	"total_limit" double precision NOT NULL,
	"current_used_value" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription_plans" ADD CONSTRAINT "user_subscription_plans_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscription_plans" ADD CONSTRAINT "user_subscription_plans_source_id_subscription_plans_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permission_configs_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission_configs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_data" ADD CONSTRAINT "task_data_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_results" ADD CONSTRAINT "task_results_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_results" ADD CONSTRAINT "task_results_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_metric_limits" ADD CONSTRAINT "user_metric_limits_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_user_id_idx" ON "tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_type_idx" ON "tasks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "task_created_at_idx" ON "tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_data_task_id_idx" ON "task_data" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_result_user_id_idx" ON "task_results" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_result_task_id_idx" ON "task_results" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_result_type_idx" ON "task_results" USING btree ("type");--> statement-breakpoint
CREATE INDEX "task_result_status_idx" ON "task_results" USING btree ("status");--> statement-breakpoint
CREATE INDEX "billable_metrics_code_idx" ON "billable_metrics" USING btree ("code");--> statement-breakpoint
CREATE INDEX "user_metric_limits_user_id_idx" ON "user_metric_limits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_metric_limits_code_idx" ON "user_metric_limits" USING btree ("code");