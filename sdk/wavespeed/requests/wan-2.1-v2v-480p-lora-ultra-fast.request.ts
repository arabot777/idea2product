import { z } from 'zod';
import { BaseRequest } from '../base';

// LoraWeightSchema definition
const LoraWeightSchema = z.object({
  path: z.string().describe('Path to the LoRA model'),
  scale: z.number().describe('Scale of the LoRA model'),
});

// Main Schema definition
const Wan21V2v480pLoraUltraFastSchema = z.object({
  duration: z.number().int().min(5).max(10).default(5).describe('Generate video duration length seconds.').optional(),
  enable_safety_checker: z.boolean().default(true).describe('Whether to enable the safety checker.').optional(),
  flow_shift: z.number().min(1).max(10).default(3).describe('The shift value for the timestep schedule for flow matching.').optional(),
  guidance_scale: z.number().min(1.01).max(10).default(5).describe('The guidance scale for generation.').optional(),
  loras: z.array(LoraWeightSchema).max(3).default([]).describe('The LoRA weights for generating the output.').optional(),
  negative_prompt: z.string().default('').describe('The negative prompt for generating the output.').optional(),
  num_inference_steps: z.number().int().min(1).max(40).default(30).describe('The number of inference steps.').optional(),
  prompt: z.string().min(1, { message: 'Prompt text is required.' }).describe('The prompt for generating the output.'),
  seed: z.number().int().default(-1).describe('The seed for random number generation.').optional(),
  strength: z.number().min(0.1).max(1).default(0.9).optional(),
  video: z.string().min(1, { message: 'Video URL is required.' }).describe('The video for generating the output.'),
});

export class Wan21V2v480pLoraUltraFastRequest extends BaseRequest<typeof Wan21V2v480pLoraUltraFastSchema> {
  protected schema = Wan21V2v480pLoraUltraFastSchema;
  
  static create(
    video: string,
    prompt: string,
    loras?: Array<{ path: string; scale: number }>,
    negative_prompt?: string,
    num_inference_steps?: number,
    duration?: number,
    strength?: number,
    guidance_scale?: number,
    flow_shift?: number,
    seed?: number,
    enable_safety_checker?: boolean
  ) {
    const request = new Wan21V2v480pLoraUltraFastRequest();
    request.data = {
      video,
      prompt,
      ...(loras !== undefined && { loras }),
      ...(negative_prompt !== undefined && { negative_prompt }),
      ...(num_inference_steps !== undefined && { num_inference_steps }),
      ...(duration !== undefined && { duration }),
      ...(strength !== undefined && { strength }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(flow_shift !== undefined && { flow_shift }),
      ...(seed !== undefined && { seed }),
      ...(enable_safety_checker !== undefined && { enable_safety_checker }),
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/v2v-480p-lora-ultra-fast";
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