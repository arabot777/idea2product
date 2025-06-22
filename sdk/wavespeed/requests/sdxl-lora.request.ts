import { z } from 'zod';
import { BaseRequest } from '../base';

// LoraWeight Schema
const LoraWeightSchema = z.object({
  path: z.string().describe('Path to the LoRA model'),
  scale: z.number().min(0.0).max(4.0).describe('Scale of the LoRA model'),
});

const SdxlLoraSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt is required' }).describe('Input prompt for image generation'),
  image: z.string().describe(''),
  mask_image: z.string().optional().describe('The mask image tells the model where to generate new pixels (white) and where to preserve the original image (black). It acts as a stencil or guide for targeted image editing.'),
  strength: z.number().min(0.01).max(1).step(0.01).default(0.8).describe('Strength indicates extent to transform the reference image'),
  loras: z.array(LoraWeightSchema).max(5).default([
    {
      path: "nerijs/pixel-art-xl",
      scale: 1
    }
  ]).describe('List of LoRAs to apply (max 5)'),
  size: z.string().default("1024*1024").describe('Output image size'),
  num_inference_steps: z.number().int().min(1).max(50).default(30).describe('Number of inference steps'),
  guidance_scale: z.number().min(0).max(10).step(0.1).default(5).describe('Guidance scale for generation'),
  num_images: z.number().int().min(1).max(4).default(1).describe('Number of images to generate'),
  seed: z.number().int().default(-1).describe('Random seed (-1 for random)'),
  enable_base64_output: z.boolean().default(false).describe('If enabled, the output will be encoded into a BASE64 string instead of a URL.'),
  enable_safety_checker: z.boolean().default(true).describe('Enable safety checker'),
});

export class SdxlLoraRequest extends BaseRequest<typeof SdxlLoraSchema> {
  protected schema = SdxlLoraSchema;
  
  static create(
    prompt: string,
    image: string = SdxlLoraSchema.shape.image.parse(undefined),
    mask_image?: string,
    strength: number = SdxlLoraSchema.shape.strength.parse(undefined),
    loras: z.infer<typeof LoraWeightSchema>[] = SdxlLoraSchema.shape.loras.parse(undefined),
    size: string = SdxlLoraSchema.shape.size.parse(undefined),
    num_inference_steps: number = SdxlLoraSchema.shape.num_inference_steps.parse(undefined),
    guidance_scale: number = SdxlLoraSchema.shape.guidance_scale.parse(undefined),
    num_images: number = SdxlLoraSchema.shape.num_images.parse(undefined),
    seed: number = SdxlLoraSchema.shape.seed.parse(undefined),
    enable_base64_output: boolean = SdxlLoraSchema.shape.enable_base64_output.parse(undefined),
    enable_safety_checker: boolean = SdxlLoraSchema.shape.enable_safety_checker.parse(undefined)
  ) {
    const request = new SdxlLoraRequest();
    request.data = {
      prompt,
      image,
      mask_image,
      strength,
      loras,
      size,
      num_inference_steps,
      guidance_scale,
      num_images,
      seed,
      enable_base64_output,
      enable_safety_checker
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/sdxl-lora";
  }

  getModelType(): string {
    return "text-to-image";
  }

  getDefaultParams(): Record<string,any> {
    return {
      num_inference_steps: 30,
      num_images: 1,
    }
  }

  getFeatureCalculator(): string {
    return "num_images";
  }
}