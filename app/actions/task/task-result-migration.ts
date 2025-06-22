"use server";

import { NewTaskResult, TaskResult } from "@/lib/db/schemas/task/task-result";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { createClient } from "@/lib/supabase/admin";
import { TaskResultsEdit } from "@/lib/db/crud/task/task-results.edit";
import { TaskResultStatus, TaskResultType } from "@/lib/types/task/enum.bean";
import { v4 as uuidv4 } from "uuid";

export async function taskResultMigration(results: NewTaskResult[], userContext: UserContext) {
  const supabase = await createClient();
  const bucketName = "user-bucket";

  for (const result of results) {
    let currentResult = { ...result };

    if (currentResult.status === TaskResultStatus.COMPLETED && currentResult.storageUrl) {
      try {
        const response = await fetch(currentResult.storageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file from ${currentResult.storageUrl}: ${response.statusText}`);
        }
        const blob = await response.blob();
        let mimeType = response.headers.get("content-type");
        if (!mimeType) {
          mimeType = "";
          currentResult.mimeType = "application/octet-stream";
          currentResult.type = TaskResultType.FILE;
        } else {
          currentResult.mimeType = mimeType;
          if (mimeType.startsWith("image/")) {
            currentResult.type = TaskResultType.IMAGE;
          } else if (mimeType.startsWith("video/")) {
            currentResult.type = TaskResultType.VIDEO;
          } else if (mimeType.startsWith("audio/")) {
            currentResult.type = TaskResultType.AUDIO;
          } else if (mimeType.startsWith("model/")) {
            currentResult.type = TaskResultType.THREE_D;
          }
        }
        const fileExtension = mimeType ? mimeType.split("/").pop() : "bin";
        const fileName = `${uuidv4()}.${fileExtension}`;

        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        let fileTypeFolder = "others";
        if (currentResult.type === TaskResultType.IMAGE) {
          fileTypeFolder = "images";
        } else if (currentResult.type === TaskResultType.VIDEO) {
          fileTypeFolder = "videos";
        } else if (currentResult.type === TaskResultType.AUDIO) {
          fileTypeFolder = "audios";
        }
        const filePath = `${userContext.id}/${fileTypeFolder}/${year}${month}/${fileName}`;

        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: currentResult.mimeType || undefined,
        });
        if (error) {
          console.error(`Error uploading file for task result ${currentResult.id}:`, error);
          currentResult.status = TaskResultStatus.FAILED;
          currentResult.message = `Failed to upload file: ${error.message}`;
        } else {
          const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
          currentResult.storageUrl = publicUrlData.publicUrl;
        }
      } catch (e: any) {
        console.error(`Unexpected error during file upload for task result ${currentResult.id}:`, e);
        currentResult.status = TaskResultStatus.FAILED;
        currentResult.message = `Failed to upload file: ${e.message}`;
      }
    }
    try {
      await TaskResultsEdit.create(currentResult);
    } catch (error: any) {
      console.error(`Error creating task result ${currentResult.id}:`, error);
    }
  }
}
