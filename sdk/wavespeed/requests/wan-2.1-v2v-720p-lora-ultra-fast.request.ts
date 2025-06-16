import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21V2v720pLoraUltraFastSchema = z.object({
  duration: z.number().int().min(5).max(10).describe(`Generate video duration length seconds.`),
  enable_safety_checker: z.boolean().describe(`Whether to enable the safety checker.`).optional(),
  flow_shift: z.number().min(1).max(10).describe(`The shift value for the timestep schedule for flow matching.`).optional(),
  guidance_scale: z.number().min(1.01).max(10).describe(`The guidance scale for generation.`).optional(),
  loras: z.array(z.object({
          path: z.string().min(1, { message: 'Path to the LoRA model is required' }).describe('Path to the LoRA model'),
          scale: z.number().min(0.0).max(4.0).describe('Scale of the LoRA model'),
        })).max(3).describe(`The LoRA weights for generating the output.`).optional(),
  negative_prompt: z.string().describe(`The negative prompt for generating the output.`).optional(),
  num_inference_steps: z.number().int().min(1).max(40).describe(`The number of inference steps.`).optional(),
  prompt: z.string().min(1, { message: 'Prompt is required' }),
  seed: z.number().int().describe(`The seed for random number generation.`).optional(),
  strength: z.number().min(0.1).max(1).optional(),
  video: z.string().min(1, { message: 'Video is required' }).describe(`The video for generating the output.`),
});

export class Wan21V2v720pLoraUltraFastRequest extends BaseRequest<typeof Wan21V2v720pLoraUltraFastSchema> {
  protected schema = Wan21V2v720pLoraUltraFastSchema;
  
  static create({ video, prompt, loras, negative_prompt, num_inference_steps, duration, strength, guidance_scale, flow_shift, seed, enable_safety_checker }: { video: string, prompt: string, loras?: Array<{ path: string; scale: number }>, negative_prompt?: string, num_inference_steps?: number, duration?: number, strength?: number, guidance_scale?: number, flow_shift?: number, seed?: number, enable_safety_checker?: boolean }) {
    const request = new Wan21V2v720pLoraUltraFastRequest();
    request.data = {
      video,
      prompt,
      loras,
      negative_prompt,
      num_inference_steps,
      duration: duration ?? 5,
      strength: strength ?? 0.9,
      guidance_scale: guidance_scale ?? 5,
      flow_shift: flow_shift ?? 3,
      seed: seed ?? -1,
      enable_safety_checker: enable_safety_checker ?? true,
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/v2v-720p-lora-ultra-fast";
  }

  getModelType(): string {
    return "video-to-video";
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