import { z } from 'zod';
import { BaseRequest } from '../base';

const SkyReelsV1Schema = z.object({
  aspect_ratio: z.enum(["16:9", "9:16"]).optional().default("16:9").describe('Aspect ratio of the output video'),
  guidance_scale: z.number().min(1).max(20).optional().default(6).describe('Guidance scale for generation (between 1.0 and 20.0)'),
  image: z.string().min(1, { message: 'URL of the image input is required' }).describe('URL of the image input.'),
  negative_prompt: z.string().optional().describe('Negative prompt to guide generation away from certain attributes.'),
  num_inference_steps: z.number().int().min(1).max(50).optional().default(30).describe('Number of denoising steps (between 1 and 50). Higher values give better quality but take longer.'),
  prompt: z.string().min(1, { message: 'The prompt to generate the video from is required' }).describe('The prompt to generate the video from.'),
  seed: z.number().int().optional().describe('Random seed for generation. If not provided, a random seed will be used.')
});

export class SkyReelsV1Request extends BaseRequest<typeof SkyReelsV1Schema> {
  protected schema = SkyReelsV1Schema;
  protected data: z.infer<typeof SkyReelsV1Schema>;

  constructor(
    prompt: string,
    image: string,
    seed?: number,
    guidance_scale?: number,
    num_inference_steps?: number,
    negative_prompt?: string,
    aspect_ratio?: "16:9" | "9:16"
  ) {
    super();
    this.data = {
      prompt,
      image,
      seed,
      guidance_scale: guidance_scale === undefined ? 6 : guidance_scale,
      num_inference_steps: num_inference_steps === undefined ? 30 : num_inference_steps,
      negative_prompt,
      aspect_ratio: aspect_ratio === undefined ? "16:9" : aspect_ratio
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/SkyReels-V1";
  }

  getModelType(): string {
    return "image-to-video";
  }

  static getDefaultParams(): Record<string,any> {
    return {
      num_inference_steps: 30,
    }
  }

  static getFeatureCalculator(): string {
    return "1";
  }
}