"use server";

import { createClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";
import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { getTranslations } from 'next-intl/server';

export const uploadFile = dataActionWithPermission("uploadFile", async (formData: FormData, userContext: UserContext) => {
  const t = await getTranslations('CommonUpload');
  const supabase = await createClient();
  const file = formData.get("file") as File;

  if (!file) {
    return { error: t('noFileProvided') };
  }

  const bucketName = "user-bucket";

  // Check if file type is allowed
  // Define allowed file types
  const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/tiff"];
  const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
  const allowedAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac", "audio/webm"];

  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedAudioTypes];

  if (!allowedTypes.includes(file.type)) {
    return { error: t('fileTypeNotAllowed') };
  }

  // Check file size limit (50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    return { error: t('fileSizeExceedsLimit') };
  }

  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  // Determine storage subfolder based on file type
  let fileTypeFolder = "others";
  if (file.type.startsWith("image/")) {
    fileTypeFolder = "images";
  } else if (file.type.startsWith("video/")) {
    fileTypeFolder = "videos";
  } else if (file.type.startsWith("audio/")) {
    fileTypeFolder = "audios";
  }

  // Get current year and month
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Month starts from 0, so add 1 and pad with two digits

  // Construct new file path: userContext.id/fileTypeFolder/YYYY/MM/fileName
  const filePath = `${userContext.id}/${fileTypeFolder}/${year}${month}/${fileName}`;

  try {
    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Error uploading file:", error);
      return { error: error.message };
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return { data: { path: data.path, publicUrl: publicUrlData.publicUrl } };
  } catch (e: any) {
    console.error("Unexpected error during file upload:", e);
    return { error: e.message };
  }
});
