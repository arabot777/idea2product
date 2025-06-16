import { z } from "zod";
import { BaseRequest } from "../base";

const FluxKontextProSchema = z.object({
  prompt: z.string().describe("The prompt to generate an image from."),
  image: z.string().describe("The image to generate an image from."),
  seed: z
    .number()
    .int()
    .min(-1)
    .max(9999999999)
    .optional()
    .describe("The same seed and the same prompt given to the same version of the model will output the same image every time."),
  guidance_scale: z
    .number()
    .min(1)
    .max(10)
    .default(3.5)
    .optional()
    .describe(
      "The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you."
    ),
  safety_tolerance: z
    .enum(["1", "2", "3", "4", "5"])
    .default("2")
    .optional()
    .describe("The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive."),
});

export class FluxKontextProRequest extends BaseRequest<typeof FluxKontextProSchema> {
  protected schema = FluxKontextProSchema;

  static create(prompt: string, image: string, seed?: number, guidance_scale?: number, safety_tolerance?: "1" | "2" | "3" | "4" | "5") {
    const request = new FluxKontextProRequest();
    request.data = {
      prompt,
      image,
      ...(seed !== undefined && { seed }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(safety_tolerance !== undefined && { safety_tolerance }),
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-kontext-pro";
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
