import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().describe('Path to the LoRA model'),
  scale: z.number().min(0.0).max(4.0).describe('Scale of the LoRA model'),
});

const FluxDevFillSchema = z.object({
  enable_safety_checker: z.boolean().default(true).describe('If set to true, the safety checker will be enabled.').optional(),
  guidance_scale: z.number().min(28).max(35).default(30).describe('\n            The CFG (Classifier Free Guidance) scale is a measure of how close you want\n            the model to stick to your prompt when looking for a related image to show you.\n        ').optional(),
  image: z.string().describe('The URL of the image to generate an image from.'),
  loras: z.array(LoraWeightSchema).max(5).default([]).describe('List of LoRAs to apply (max 5)').optional(),
  mask_image: z.string().describe('The URL of the mask image to generate an image from.').optional(),
  num_images: z.number().int().min(1).max(4).default(1).describe('The number of images to generate.').optional(),
  num_inference_steps: z.number().int().min(1).max(50).default(28).describe('The number of inference steps to perform.').optional(),
  prompt: z.string().describe('The prompt to generate an image from.').optional(),
  seed: z.number().int().min(-1).max(9999999999).default(0).describe('\n            The same seed and the same prompt given to the same version of the model\n            will output the same image every time.\n        ').optional(),
  size: z.string().default("1024*1024").describe('The size of the generated image.').optional(),
});

export class FluxDevFillRequest extends BaseRequest<typeof FluxDevFillSchema> {
  protected schema = FluxDevFillSchema;
  protected data: z.infer<typeof FluxDevFillSchema>;

  constructor(
    image: string,
    mask_image?: string,
    prompt?: string,
    size?: string,
    num_inference_steps?: number,
    seed?: number,
    guidance_scale?: number,
    num_images?: number,
    loras?: Array<{ path: string; scale: number }>,
    enable_safety_checker?: boolean,
  ) {
    super();
    this.data = {
      image,
      mask_image,
      prompt,
      size,
      num_inference_steps,
      seed,
      guidance_scale,
      num_images,
      loras,
      enable_safety_checker,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-dev-fill";
  }

  getModelType(): string {
    return "image-to-image";
  }

  static getDefaultParams(): Record<string,any> {
    return {
      num_inference_steps: 28,
      num_images: 1,
    }
  }

  static getFeatureCalculator(): string {
    return "num_images";
  }
}