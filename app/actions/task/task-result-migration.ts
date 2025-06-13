import { NewTaskResult, TaskResult } from "@/lib/db/schemas/task/task-result";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { createClient } from "@/lib/supabase/admin";
import { TaskResultsEdit } from "@/lib/db/crud/task/task-results.edit";
import { TaskResultStatus } from "@/lib/types/task/enum.bean";
import { v4 as uuidv4 } from "uuid";

export async function taskResultMigration(results: NewTaskResult[],userContext: UserContext) {
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

        const fileExtension = currentResult.mimeType ? currentResult.mimeType.split("/").pop() : "bin";
        const fileName = `${uuidv4()}.${fileExtension}`;

        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        let fileTypeFolder = "others";
        if (currentResult.mimeType?.startsWith("image/")) {
          fileTypeFolder = "images";
        } else if (currentResult.mimeType?.startsWith("video/")) {
          fileTypeFolder = "videos";
        } else if (currentResult.mimeType?.startsWith("audio/")) {
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
