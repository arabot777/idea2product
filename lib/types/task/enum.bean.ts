export const TaskStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];

export type TaskResultStatusType = typeof TaskResultStatus[keyof typeof TaskResultStatus];

export type TaskResultTypeType = typeof TaskResultType[keyof typeof TaskResultType];

export const TaskResultStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
  REJECTED_NSFW: "rejected_nsfw",
} as const;

export const TaskResultType = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  THREE_D: "3d",
} as const;
  