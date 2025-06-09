import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21V2v720pUltraFastSchema = z.object({
  duration: z.number().int().min(5).max(10).optional().default(5).describe('Generate video duration length seconds.'),
  enable_safety_checker: z.boolean().optional().default(true).describe('Whether to enable the safety checker.'),
  flow_shift: z.number().min(1).max(10).optional().default(3).describe('The shift value for the timestep schedule for flow matching.'),
  guidance_scale: z.number().min(1.01).max(10).optional().default(5).describe('The guidance scale for generation.'),
  negative_prompt: z.string().optional().default('').describe('The negative prompt for generating the output.'),
  num_inference_steps: z.number().int().min(1).max(40).optional().default(30).describe('The number of inference steps.'),
  prompt: z.string().describe('A woman races up the staircase as rain pours down outside at night.'),
  seed: z.number().int().optional().default(-1).describe('The seed for random number generation.'),
  strength: z.number().min(0.1).max(1).optional().default(0.9),
  video: z.string().describe('The video for generating the output.'),
});

export class Wan21V2v720pUltraFastRequest extends BaseRequest<typeof Wan21V2v720pUltraFastSchema> {
  protected schema = Wan21V2v720pUltraFastSchema;
  protected data: z.infer<typeof Wan21V2v720pUltraFastSchema>;

  constructor(prompt: string, video: string, negative_prompt?: string | undefined, num_inference_steps?: number | undefined, duration?: number | undefined, strength?: number | undefined, guidance_scale?: number | undefined, flow_shift?: number | undefined, seed?: number | undefined, enable_safety_checker?: boolean | undefined) {
    super();
    this.data = {
      prompt,
      video,
      negative_prompt: negative_prompt ?? '',
      num_inference_steps: num_inference_steps ?? 30,
      duration: duration ?? 5,
      strength: strength ?? 0.9,
      guidance_scale: guidance_scale ?? 5,
      flow_shift: flow_shift ?? 3,
      seed: seed ?? -1,
      enable_safety_checker: enable_safety_checker ?? true,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/v2v-720p-ultra-fast";
  }

  getModelType(): string {
    return "video-to-video";
  }
}