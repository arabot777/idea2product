import { z } from "zod";
import { BaseRequest } from "../base";

const FluxKontextProMultiSchema = z.object({
  prompt: z
    .string()
    .min(1, {
      message: "Prompt is required",
    })
    .describe("The prompt to generate an image from."),
  images: z
    .array(z.string())
    .min(1, {
      message: "Images array cannot be empty",
    })
    .max(5)
    .describe("URL of images to use while generating the image."),
  seed: z.number().int().optional().describe("The same seed and the same prompt given to the same version of the model will output the same image every time."),
  guidance_scale: z
    .number()
    .min(1)
    .max(10)
    .optional()
    .describe(
      "The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you."
    ),
  safety_tolerance: z
    .enum(["1", "2", "3", "4", "5"])
    .optional()
    .describe("The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive."),
});

export class FluxKontextProMultiRequest extends BaseRequest<typeof FluxKontextProMultiSchema> {
  protected schema = FluxKontextProMultiSchema;

  static create(prompt: string, images: string[], seed?: number, guidance_scale?: number, safety_tolerance?: "1" | "2" | "3" | "4" | "5") {
    const request = new FluxKontextProMultiRequest();
    request.data = {
      prompt,
      images,
      ...(seed !== undefined && { seed }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(safety_tolerance !== undefined && { safety_tolerance }),
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-kontext-pro/multi";
  }

  getModelType(): string {
    return "image-to-image";
  }

  getDefaultParams(): Record<string, any> {
    return {};
  }

  getFeatureCalculator(): string {
    return "1";
  }
}
