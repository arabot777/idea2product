import { z } from "zod";
import { BaseRequest } from "../base";

const FluxKontextProTextToImageSchema = z.object({
  prompt: z
    .string()
    .min(1, {
      message: "Prompt is required",
    })
    .describe("The prompt to generate an image from."),
  aspect_ratio: z
    .enum(["21:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16", "9:21"])
    .optional()
    .default("1:1")
    .describe("The aspect ratio of the generated image."),
  guidance_scale: z
    .number()
    .min(1)
    .max(10)
    .optional()
    .default(3.5)
    .describe(
      "The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you."
    ),
  num_images: z.number().int().min(1).max(4).optional().default(1).describe("The number of images to generate."),
  safety_tolerance: z
    .enum(["1", "2", "3", "4", "5"])
    .optional()
    .default("2")
    .describe("The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive."),
  seed: z.number().int().optional().describe("The same seed and the same prompt given to the same version of the model will output the same image every time."),
});

export class FluxKontextProTextToImageRequest extends BaseRequest<typeof FluxKontextProTextToImageSchema> {
  protected schema = FluxKontextProTextToImageSchema;

  static create(
    prompt: string,
    aspect_ratio?: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21",
    num_images?: number,
    seed?: number,
    guidance_scale?: number,
    safety_tolerance?: "1" | "2" | "3" | "4" | "5"
  ) {
    const request = new FluxKontextProTextToImageRequest();
    request.data = {
      prompt,
      aspect_ratio: aspect_ratio ?? "1:1",
      num_images: num_images ?? 1,
      guidance_scale: guidance_scale ?? 3.5,
      safety_tolerance: safety_tolerance ?? "2",
      ...(seed !== undefined && { seed }),
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-kontext-pro/text-to-image";
  }

  getModelType(): string {
    return "text-to-image";
  }

  getDefaultParams(): Record<string, any> {
    return {
      num_images: 1,
    };
  }

  getFeatureCalculator(): string {
    return "num_images";
  }
}
