import { z } from "zod";
import { BaseRequest } from "../base";

const SeedanceV1LiteT2V480pSchema = z.object({
  prompt: z.string().max(2000).describe("Text prompt for video generation; Positive text prompt; Cannot exceed 2000 characters"),
  aspect_ratio: z.enum(["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "9:21"]).default("16:9").describe("The aspect ratio of the generated video"),
  resolution: z.enum(["480p", "720p", "1080p"]).default("480p").describe("The resolution of the generated video"),
  model: z.enum(["seedance-v1-lite", "seedance-v1-pro"]).default("seedance-v1-lite").describe("The model to use for video generation"),
  duration: z.number().int().min(5).max(10).step(5).default(5).describe("Generate video duration length in seconds (5 or 10)"),
  seed: z.number().int().default(-1).describe("The seed for random number generation"),
});

export class SeedanceV1LiteT2V480pRequest extends BaseRequest<typeof SeedanceV1LiteT2V480pSchema> {
  protected schema = SeedanceV1LiteT2V480pSchema;

  static create(
    prompt: string,
    resolution: "480p" | "720p" | "1080p" = "480p",
    model: "seedance-v1-lite" | "seedance-v1-pro" = "seedance-v1-lite",
    aspect_ratio: "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16" | "9:21" = "16:9",
    duration: 5 | 10 = 5,
    seed: number = -1
  ) {
    const request = new SeedanceV1LiteT2V480pRequest();
    request.data = {
      prompt,
      resolution,
      model,
      aspect_ratio,
      duration,
      seed,
    };
    return request;
  }

  getModelUuid(): string {
    if (this.data.model === "seedance-v1-pro") {
      if (this.data.resolution === "1080p") {
        return "bytedance/seedance-v1-pro-t2v-1080p";
      } else if (this.data.resolution === "720p") {
        return "bytedance/seedance-v1-pro-t2v-720p";
      } else {
        return "bytedance/seedance-v1-pro-t2v-480p";
      }
    } else {
      if (this.data.resolution === "1080p") {
        return "bytedance/seedance-v1-lite-t2v-1080p";
      } else if (this.data.resolution === "720p") {
        return "bytedance/seedance-v1-lite-t2v-720p";
      } else {
        return "bytedance/seedance-v1-lite-t2v-480p";
      }
    }
  }

  getModelType(): string {
    return "text-to-video";
  }

  getDefaultParams(): Record<string, any> {
    return {
      resolution: "480p",
      model: "seedance-v1-lite",
      aspect_ratio: "16:9",
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
