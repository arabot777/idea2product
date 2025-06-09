import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().min(1, { message: 'Path to the LoRA model is required' }).describe('Path to the LoRA model'),
  scale: z.number().min(0.0).max(4.0).describe('Scale of the LoRA model'),
});

const FluxSchnellLoraSchema = z.object({
  prompt: z.string().min(1, { message: 'Input prompt for image generation is required' }).describe('Input prompt for image generation'),
  image: z.string().describe(''),
  mask_image: z.string().optional().describe('The mask image tells the model where to generate new pixels (white) and where to preserve the original image (black). It acts as a stencil or guide for targeted image editing.'),
  strength: z.number().min(0).max(1).default(0.8).describe('Strength indicates extent to transform the reference image'),
  loras: z.array(LoraWeightSchema).max(5).default([]).describe('List of LoRAs to apply (max 5)'),
  size: z.string().default("1024*1024").describe('Output image size'),
  num_inference_steps: z.number().int().min(1).max(8).default(4).describe('Number of inference steps'),
  guidance_scale: z.number().min(0).max(10).default(3.5).describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  num_images: z.number().int().min(1).max(4).default(1).describe('Number of images to generate'),
  seed: z.number().int().default(-1).describe('Random seed (-1 for random)'),
  enable_base64_output: z.boolean().default(false).describe('If enabled, the output will be encoded into a BASE64 string instead of a URL.'),
  enable_safety_checker: z.boolean().default(true).describe('Enable safety checker'),
});

export class FluxSchnellLoraRequest extends BaseRequest<typeof FluxSchnellLoraSchema> {
  protected schema = FluxSchnellLoraSchema;
  protected data: z.infer<typeof FluxSchnellLoraSchema>;

  constructor(params: {
    prompt: string;
    image?: string;
    mask_image?: string;
    strength?: number;
    loras?: Array<{ path: string; scale: number }>;
    size?: string;
    num_inference_steps?: number;
    guidance_scale?: number;
    num_images?: number;
    seed?: number;
    enable_base64_output?: boolean;
    enable_safety_checker?: boolean;
  }) {
    super();
    this.data = this.schema.parse(params);
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-schnell-lora";
  }

  getModelType(): string {
    return "text-to-image";
  }
}