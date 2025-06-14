import { z } from 'zod';
import { BaseRequest } from '../base';

const SdxlSchema = z.object({
  enable_base64_output: z.boolean().optional().default(false).describe('If enabled, the output will be encoded into a BASE64 string instead of a URL.'),
  enable_safety_checker: z.boolean().optional().default(true).describe('Enable safety checker'),
  guidance_scale: z.number().min(0).max(10).optional().default(5).describe('Guidance scale for generation'),
  image: z.string().optional().default(""),
  mask_image: z.string().optional().describe('The mask image tells the model where to generate new pixels (white) and where to preserve the original image (black). It acts as a stencil or guide for targeted image editing.'),
  num_images: z.number().int().min(1).max(4).optional().default(1).describe('Number of images to generate'),
  num_inference_steps: z.number().int().min(1).max(50).optional().default(30).describe('Number of inference steps'),
  prompt: z.string().min(1, {
    message: 'Input prompt for image generation is required',
  }).describe('Input prompt for image generation'),
  seed: z.number().int().optional().default(-1).describe('Random seed (-1 for random)'),
  size: z.string().optional().default("1024*1024").describe('Output image size'),
  strength: z.number().min(0.01).max(1).optional().default(0.8).describe('Strength indicates extent to transform the reference image')
});

export class SdxlRequest extends BaseRequest<typeof SdxlSchema> {
  protected schema = SdxlSchema;
  protected data: z.infer<typeof SdxlSchema>;

  constructor(
    prompt: string,
    enable_base64_output?: boolean,
    enable_safety_checker?: boolean,
    guidance_scale?: number,
    image?: string,
    mask_image?: string,
    num_images?: number,
    num_inference_steps?: number,
    seed?: number,
    size?: string,
    strength?: number
  ) {
    super();
    this.data = {
      prompt: prompt,
      enable_base64_output: enable_base64_output ?? false,
      enable_safety_checker: enable_safety_checker ?? true,
      guidance_scale: guidance_scale ?? 5,
      image: image ?? "",
      mask_image: mask_image,
      num_images: num_images ?? 1,
      num_inference_steps: num_inference_steps ?? 30,
      seed: seed ?? -1,
      size: size ?? "1024*1024",
      strength: strength ?? 0.8
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/sdxl";
  }

  getModelType(): string {
    return "text-to-image";
  }

  static getDefaultParams(): Record<string,any> {
    return {
      num_images: 1,
      num_inference_steps: 30,
    }
  }

  static getFeatureCalculator(): string {
    return "num_images";
  }
}