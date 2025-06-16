import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().describe('Path to the LoRA model'),
  scale: z.number().min(0.0).max(4.0).describe('Scale of the LoRA model'),
});
const Wan21T2v720pLoraSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt text is required for video generation',
  }).describe('The prompt for generating the output.'),
  negative_prompt: z.string().optional().default('').describe('The negative prompt for generating the output.'),
  loras: z.array(LoraWeightSchema).max(3).optional().default([]).describe('The LoRA weights for generating the output.'),
  size: z.enum(["1280*720", "720*1280"]).optional().default("1280*720").describe('The size of the output.'),
  num_inference_steps: z.number().int().min(1).max(40).optional().default(30).describe('The number of inference steps.'),
  duration: z.number().int().min(5).max(10).optional().default(5).describe('Generate video duration length seconds.'),
  guidance_scale: z.number().min(1.01).max(10).optional().default(5).describe('The guidance scale for generation.'),
  flow_shift: z.number().min(1).max(10).optional().default(5).describe('The shift value for the timestep schedule for flow matching.'),
  seed: z.number().int().optional().default(-1).describe('The seed for random number generation.'),
  enable_safety_checker: z.boolean().optional().default(true).describe('Whether to enable the safety checker.'),
});

export class Wan21T2v720pLoraRequest extends BaseRequest<typeof Wan21T2v720pLoraSchema> {
  protected schema = Wan21T2v720pLoraSchema;
  
  static create(
    prompt: string,
    negative_prompt?: string,
    loras?: z.infer<typeof LoraWeightSchema>[],
    size?: "1280*720" | "720*1280",
    num_inference_steps?: number,
    duration?: number,
    guidance_scale?: number,
    flow_shift?: number,
    seed?: number,
    enable_safety_checker?: boolean
  ) {
    const request = new Wan21T2v720pLoraRequest();
    request.data = {
      prompt,
      negative_prompt: negative_prompt ?? "",
      loras: loras ?? [],
      size: size ?? "1280*720",
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
    return "wavespeed-ai/wan-2.1/t2v-720p-lora";
  }

  getModelType(): string {
    return "text-to-video";
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