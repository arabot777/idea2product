import { z } from "zod";
import { BaseRequest } from "../base";

const FluxDevSchema = z.object({
  enable_base64_output: z.boolean().default(false).describe("If enabled, the output will be encoded into a BASE64 string instead of a URL."),
  enable_safety_checker: z.boolean().default(true).describe("If set to true, the safety checker will be enabled."),
  guidance_scale: z
    .number()
    .min(1)
    .max(10)
    .default(3.5)
    .describe(
      "The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you."
    ),
  image: z.string().optional().describe("The image to generate an image from."),
  mask_image: z
    .string()
    .optional()
    .describe(
      "The mask image tells the model where to generate new pixels (white) and where to preserve the original image (black). It acts as a stencil or guide for targeted image editing."
    ),
  num_images: z.number().int().min(1).max(4).default(1).describe("The number of images to generate."),
  num_inference_steps: z.number().int().min(1).max(50).default(28).describe("The number of inference steps to perform."),
  prompt: z.string().min(1, { message: "Prompt text is required for image generation" }).describe("The prompt to generate an image from."),
  seed: z
    .number()
    .int()
    .default(-1)
    .describe("The same seed and the same prompt given to the same version of the model will output the same image every time."),
  size: z.string().default("1024*1024").describe("The size of the generated image."),
  strength: z.number().min(0).max(1).default(0.8).describe("Strength indicates extent to transform the reference image"),
});

export class FluxDevRequest extends BaseRequest<typeof FluxDevSchema> {
  protected schema = FluxDevSchema;

  static create(params: {
    prompt: string;
    enable_base64_output: boolean;
    enable_safety_checker: boolean;
    guidance_scale: number;
    image?: string;
    mask_image?: string;
    num_images: number;
    num_inference_steps: number;
    seed: number;
    size: string;
    strength: number;
  }) {
    const request = new FluxDevRequest();
    request.data = { ...params };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-dev";
  }

  getModelType(): string {
    return "text-to-image";
  }

  getDefaultParams(): Record<string, any> {
    return {
      num_inference_steps: 28,
      num_images: 1,
    };
  }

  getFeatureCalculator(): string {
    return "num_images";
  }
}
