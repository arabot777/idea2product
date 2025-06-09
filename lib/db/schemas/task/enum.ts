
import { pgEnum } from "drizzle-orm/pg-core";
import { TaskStatus, TaskResultStatus, TaskResultType } from "@/lib/types/task/enum.bean";

export const taskStatusEnum = pgEnum("task_status", Object.values(TaskStatus) as [string, ...string[]]);
export const taskResultStatusEnum = pgEnum("task_result_status", Object.values(TaskResultStatus) as [string, ...string[]]);
export const taskResultTypeEnum = pgEnum("task_result_type", Object.values(TaskResultType) as [string, ...string[]]);

