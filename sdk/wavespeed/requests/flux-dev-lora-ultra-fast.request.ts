import { z } from "zod";
import { BaseRequest } from "../base";

const LoraWeightSchema = z.object({
  path: z.string().describe("Path to the LoRA model"),
  scale: z.number().min(0.0).max(4.0).describe("Scale of the LoRA model"),
});

const FluxDevLoraUltraFastSchema = z.object({
  enable_base64_output: z.boolean().default(false).describe("If enabled, the output will be encoded into a BASE64 string instead of a URL.").optional(),
  enable_safety_checker: z.boolean().default(true).describe("Enable safety checker").optional(),
  guidance_scale: z.number().min(0).max(10).default(3.5).describe("Guidance scale for generation").optional(),
  image: z.string().optional(),
  loras: z.array(LoraWeightSchema).max(5).default([]).describe("List of LoRAs to apply (max 5)").optional(),
  mask_image: z
    .string()
    .describe(
      "The mask image tells the model where to generate new pixels (white) and where to preserve the original image (black). It acts as a stencil or guide for targeted image editing."
    )
    .optional(),
  num_images: z.number().int().min(1).max(4).default(1).describe("Number of images to generate").optional(),
  num_inference_steps: z.number().int().min(1).max(50).default(28).describe("Number of inference steps").optional(),
  prompt: z.string().describe("Input prompt for image generation"),
  seed: z.number().int().default(-1).describe("Random seed (-1 for random)").optional(),
  size: z.string().default("1024*1024").describe("Output image size").optional(),
  strength: z.number().min(0.01).max(1).default(0.8).describe("Strength indicates extent to transform the reference image").optional(),
});

export class FluxDevLoraUltraFastRequest extends BaseRequest<typeof FluxDevLoraUltraFastSchema> {
  protected schema = FluxDevLoraUltraFastSchema;

  static create(
    prompt: string,
    image?: string,
    mask_image?: string,
    strength?: number,
    loras?: Array<{ path: string; scale: number }>,
    size?: string,
    num_inference_steps?: number,
    guidance_scale?: number,
    num_images?: number,
    seed?: number,
    enable_base64_output?: boolean,
    enable_safety_checker?: boolean
  ) {
    const request = new FluxDevLoraUltraFastRequest();
    request.data = {
      prompt,
      ...(image !== undefined && { image }),
      ...(mask_image !== undefined && { mask_image }),
      ...(strength !== undefined && { strength }),
      ...(loras !== undefined && { loras }),
      ...(size !== undefined && { size }),
      ...(num_inference_steps !== undefined && { num_inference_steps }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(num_images !== undefined && { num_images }),
      ...(seed !== undefined && { seed }),
      ...(enable_base64_output !== undefined && { enable_base64_output }),
      ...(enable_safety_checker !== undefined && { enable_safety_checker }),
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-dev-lora-ultra-fast";
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
