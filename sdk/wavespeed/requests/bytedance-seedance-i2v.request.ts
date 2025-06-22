import { z } from "zod";
import { BaseRequest } from "../base";

const SeedanceV1ProI2V480pSchema = z.object({
  image: z
    .string()
    .describe(
      "Input image for video generation; Supported image formats include .jpg/.jpeg/.png; The image file size cannot exceed 10MB, and the image resolution should not be less than 300*300px"
    ),
  prompt: z
    .string()
    .max(2000)
    .default("A beautiful scene with smooth camera movement and natural motion")
    .describe("Text prompt for video generation; Positive text prompt; Cannot exceed 2000 characters"),
  resolution: z.enum(["480p", "720p", "1080p"]).default("480p").describe("The resolution of the generated video"),
  model: z.enum(["seedance-v1-lite", "seedance-v1-pro"]).default("seedance-v1-lite").describe("The model to use for video generation"),
  duration: z.number().int().min(5).max(10).step(5).default(5).describe("Generate video duration length in seconds (5 or 10)"),
  seed: z.number().int().default(-1).describe("The seed for random number generation"),
});

export class SeedanceV1ProI2V480pRequest extends BaseRequest<typeof SeedanceV1ProI2V480pSchema> {
  protected schema = SeedanceV1ProI2V480pSchema;

  static create(
    image: string,
    prompt: string = "A beautiful scene with smooth camera movement and natural motion",
    resolution: "480p" | "720p" | "1080p" = "480p",
    model: "seedance-v1-lite" | "seedance-v1-pro" = "seedance-v1-lite",
    duration: 5 | 10 = 5,
    seed: number = -1
  ) {
    const request = new SeedanceV1ProI2V480pRequest();
    request.data = {
      image,
      prompt,
      resolution,
      model,
      duration,
      seed,
    };
    return request;
  }

  getModelUuid(): string {
    if (this.data.model === "seedance-v1-pro") {
      if (this.data.resolution === "1080p") {
        return "bytedance/seedance-v1-pro-i2v-1080p";
      } else if (this.data.resolution === "720p") {
        return "bytedance/seedance-v1-pro-i2v-720p";
      } else {
        return "bytedance/seedance-v1-pro-i2v-480p";
      }
    } else {
      if (this.data.resolution === "1080p") {
        return "bytedance/seedance-v1-lite-i2v-1080p";
      } else if (this.data.resolution === "720p") {
        return "bytedance/seedance-v1-lite-i2v-720p";
      } else {
        return "bytedance/seedance-v1-lite-i2v-480p";
      }
    }
  }

  getModelType(): string {
    return "image-to-video";
  }

  getDefaultParams(): Record<string, any> {
    return {
      resolution: "480p",
      model: "seedance-v1-lite",
      duration: 5,
      seed: -1,
    };
  }

  getFeatureCalculator(): string {
    // seedance-v1-pro 1080p: 0.6, 720p: 0.3, 480p: 0.15
    // seedance-v1-lite 1080p: 0.45, 720p: 0.16, 480p: 0.08
    return `model === 'seedance-v1-pro' ? (resolution === '1080p' ? (duration/5) * 0.6 : resolution === '720p' ? (duration/5) * 0.3 : (duration/5) * 0.15) : (resolution === '1080p' ? (duration/5) * 0.45 : resolution === '720p' ? (duration/5) * 0.16 : (duration/5) * 0.08)`;
  }
}
