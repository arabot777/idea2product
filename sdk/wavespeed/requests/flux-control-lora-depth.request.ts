import { z } from "zod";
import { BaseRequest } from "../base";

const LoraWeightSchema = z.object({
  path: z.string().min(1, { message: "Path to the LoRA model is required" }).describe("Path to the LoRA model"),
  scale: z.number().min(0.0).max(4.0).describe("Scale of the LoRA model"),
});

const FluxControlLoraDepthSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required" }).describe("The prompt to generate an image from."),
  control_image: z.string().optional().describe("The image to use for control lora. This is used to control the style of the generated image."),
  control_scale: z.number().min(0).max(2).step(0.01).optional().default(1).describe("The scale of the control image."),
  loras: z.array(LoraWeightSchema).max(5).optional().default([]).describe("List of LoRAs to apply (max 5)"),
  size: z.string().optional().default("864*1536").describe("The size of the generated image."),
  seed: z
    .number()
    .int()
    .min(-1)
    .max(9999999999)
    .optional()
    .default(0)
    .describe("The same seed and the same prompt given to the same version of the model will output the same image every time."),
  num_images: z.number().int().min(1).max(4).optional().default(1).describe("The number of images to generate"),
  num_inference_steps: z.number().int().min(1).max(50).optional().default(28).describe("The number of inference steps to perform."),
  guidance_scale: z
    .number()
    .min(1)
    .max(30)
    .step(0.1)
    .optional()
    .default(3.5)
    .describe(
      "The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you"
    ),
  enable_safety_checker: z.boolean().optional().default(true).describe("If set to true, the safety checker will be enabled."),
});

export class FluxControlLoraDepthRequest extends BaseRequest<typeof FluxControlLoraDepthSchema> {
  protected schema = FluxControlLoraDepthSchema;

  static create(
    prompt: string,
    control_image?: string,
    loras?: Array<{ path: string; scale: number }>,
    control_scale?: number,
    seed?: number,
    num_images?: number,
    size?: string,
    num_inference_steps?: number,
    guidance_scale?: number,
    enable_safety_checker?: boolean
  ) {
    const request = new FluxControlLoraDepthRequest();
    request.data = {
      prompt,
      control_image: control_image,
      loras: loras ?? [],
      control_scale: control_scale ?? 1,
      seed: seed ?? 0,
      num_images: num_images ?? 1,
      size: size ?? "864*1536",
      num_inference_steps: num_inference_steps ?? 28,
      guidance_scale: guidance_scale ?? 3.5,
      enable_safety_checker: enable_safety_checker ?? true,
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-control-lora-depth";
  }

  getModelType(): string {
    return "image-to-image";
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
