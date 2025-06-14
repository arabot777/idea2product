import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().describe("Path to the LoRA model"),
  scale: z.number().min(0.0).max(4.0).describe("Scale of the LoRA model"),
});

const Wan21T2v720pLoraUltraFastSchema = z.object({
  duration: z.number().int().min(5).max(10).describe(`Generate video duration length seconds.`).optional().default(5),
  enable_safety_checker: z.boolean().describe(`Whether to enable the safety checker.`).optional().default(true),
  flow_shift: z.number().min(1).max(10).describe(`The shift value for the timestep schedule for flow matching.`).optional().default(5),
  guidance_scale: z.number().min(1.01).max(10).describe(`The guidance scale for generation.`).optional().default(5),
  loras: z.array(LoraWeightSchema).max(3).describe(`The LoRA weights for generating the output.`).optional().default([]),
  negative_prompt: z.string().describe(`The negative prompt for generating the output.`).optional().default(""),
  num_inference_steps: z.number().int().min(1).max(40).describe(`The number of inference steps.`).optional().default(30),
  prompt: z.string().min(1, { message: 'prompt is required' }).describe(`The prompt for generating the output.`),
  seed: z.number().int().describe(`The seed for random number generation.`).optional().default(-1),
  size: z.enum(["1280*720", "720*1280"]).describe(`The size of the output.`).optional().default("1280*720"),
});

export class Wan21T2v720pLoraUltraFastRequest extends BaseRequest<typeof Wan21T2v720pLoraUltraFastSchema> {
  protected schema = Wan21T2v720pLoraUltraFastSchema;
  protected data: z.infer<typeof Wan21T2v720pLoraUltraFastSchema>;

  constructor(prompt: string, negative_prompt?: string, loras?: Array<{ path: string; scale: number }>, size?: "1280*720" | "720*1280", num_inference_steps?: number, duration?: number, guidance_scale?: number, flow_shift?: number, seed?: number, enable_safety_checker?: boolean) {
    super();
    this.data = {
      duration: duration ?? 5,
      enable_safety_checker: enable_safety_checker ?? true,
      flow_shift: flow_shift ?? 5,
      guidance_scale: guidance_scale ?? 5,
      loras: loras ?? [],
      negative_prompt: negative_prompt ?? "",
      num_inference_steps: num_inference_steps ?? 30,
      prompt,
      seed: seed ?? -1,
      size: size ?? "1280*720",
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/t2v-720p-lora-ultra-fast";
  }

  getModelType(): string {
    return "text-to-video";
  }
  static getDefaultParams(): Record<string,any> {
    return {
      duration: 5,
      num_inference_steps: 30,
    }
  }

  static getFeatureCalculator(): string {
    return "duration/5";
  }
}