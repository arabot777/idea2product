import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21I2v720pUltraFastSchema = z.object({
  duration: z.number().int().min(5).max(10).optional().describe('Generate video duration length seconds.'),
  enable_safety_checker: z.boolean().optional().describe('Whether to enable the safety checker.'),
  flow_shift: z.number().min(1).max(10).optional().describe('The shift value for the timestep schedule for flow matching.'),
  guidance_scale: z.number().min(1.01).max(10).optional().describe('The guidance scale for generation.'),
  image: z.string().min(1, { message: 'image is required' }).describe('The image for generating the output.'),
  negative_prompt: z.string().optional().describe('The negative prompt for generating the output.'),
  num_inference_steps: z.number().int().min(1).max(40).optional().describe('The number of inference steps.'),
  prompt: z.string().min(1, { message: 'prompt is required' }).describe('The prompt for generating the output.'),
  seed: z.number().int().optional().describe('The seed for random number generation.'),
  size: z.enum(['1280*720', '720*1280']).optional().describe('The size of the output.'),
});

export class Wan21I2v720pUltraFastRequest extends BaseRequest<typeof Wan21I2v720pUltraFastSchema> {
  protected schema = Wan21I2v720pUltraFastSchema;
  
  static create(
    image: string,
    prompt: string,
    negative_prompt?: string,
    size?: '1280*720' | '720*1280',
    num_inference_steps?: number,
    duration?: number,
    guidance_scale?: number,
    flow_shift?: number,
    seed?: number,
    enable_safety_checker?: boolean
  ) {
    const request = new Wan21I2v720pUltraFastRequest();
    request.data = {
      image,
      prompt,
      negative_prompt,
      size: size ?? '1280*720',
      num_inference_steps: num_inference_steps ?? 30,
      duration: duration ?? 5,
      guidance_scale: guidance_scale ?? 5,
      flow_shift: flow_shift ?? 5,
      seed: seed ?? -1,
      enable_safety_checker: enable_safety_checker ?? true,
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/i2v-720p-ultra-fast";
  }

  getModelType(): string {
    return "image-to-video";
  }
  getDefaultParams(): Record<string,any> {
    return {
      duration: 5,
      num_inference_steps: 30,
    }
  }

  getFeatureCalculator(): string {
    return "duration/5";
  }
}