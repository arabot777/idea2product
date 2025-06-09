import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().min(1, { message: 'Path to the LoRA model is required' }).describe("Path to the LoRA model"),
  scale: z.number().min(0.0).max(4.0).describe("Scale of the LoRA model"),
});

const FluxDevLoraSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Input prompt for image generation is required',
  }).describe("Input prompt for image generation"),
  image: z.string().optional(),
  mask_image: z.string().optional().describe("The mask image tells the model where to generate new pixels (white) and where to preserve the original image (black). It acts as a stencil or guide for targeted image editing."),
  strength: z.number().min(0).max(1).default(0.8).optional().describe("Strength indicates extent to transform the reference image"),
  loras: z.array(LoraWeightSchema).max(5).default([]).optional().describe("List of LoRAs to apply (max 5)"),
  size: z.string().default("1024*1024").optional().describe("Output image size"),
  num_inference_steps: z.number().int().min(1).max(50).default(28).optional().describe("Number of inference steps"),
  guidance_scale: z.number().min(0).max(10).default(3.5).optional().describe("Guidance scale for generation"),
  num_images: z.number().int().min(1).max(4).default(1).optional().describe("Number of images to generate"),
  seed: z.number().int().min(-1).max(9999999999).default(-1).optional().describe("Random seed (-1 for random)"),
  enable_base64_output: z.boolean().default(false).optional().describe("If enabled, the output will be encoded into a BASE64 string instead of a URL."),
  enable_safety_checker: z.boolean().default(true).optional().describe("Enable safety checker"),
});

export class FluxDevLoraRequest extends BaseRequest<typeof FluxDevLoraSchema> {
  protected schema = FluxDevLoraSchema;
  protected data: z.infer<typeof FluxDevLoraSchema>;

  constructor(
    prompt: string,
    image?: string,
    mask_image?: string,
    strength?: number,
    loras?: z.infer<typeof LoraWeightSchema>[],
    size?: string,
    num_inference_steps?: number,
    guidance_scale?: number,
    num_images?: number,
    seed?: number,
    enable_base64_output?: boolean,
    enable_safety_checker?: boolean
  ) {
    super();
    this.data = {
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
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-dev-lora";
  }

  getModelType(): string {
    return "text-to-image";
  }
}