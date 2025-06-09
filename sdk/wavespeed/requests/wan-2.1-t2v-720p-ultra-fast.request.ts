import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21T2v720pUltraFastSchema = z.object({
  duration: z.number().int().min(5).max(10).default(5).describe("Generate video duration length seconds.").optional(),
  enable_safety_checker: z.boolean().default(true).describe("Whether to enable the safety checker.").optional(),
  flow_shift: z.number().min(1).max(10).default(5).describe("The shift value for the timestep schedule for flow matching.").optional(),
  guidance_scale: z.number().min(1.01).max(10).default(5).describe("The guidance scale for generation.").optional(),
  negative_prompt: z.string().default("").describe("The negative prompt for generating the output.").optional(),
  num_inference_steps: z.number().int().min(0.1).max(40).default(30).describe("The number of inference steps.").optional(),
  prompt: z.string().min(1, { message: 'prompt is required' }).describe("The prompt for generating the output."),
  seed: z.number().int().default(-1).describe("The seed for random number generation.").optional(),
  size: z.enum(['1280*720', '720*1280']).default("1280*720").describe("The size of the output.").optional(),
});

export class Wan21T2v720pUltraFastRequest extends BaseRequest<typeof Wan21T2v720pUltraFastSchema> {
  protected schema = Wan21T2v720pUltraFastSchema;
  protected data: z.infer<typeof Wan21T2v720pUltraFastSchema>;

  constructor(params: {
    prompt: string;
    negative_prompt?: string;
    size?: "1280*720" | "720*1280";
    num_inference_steps?: number;
    duration?: number;
    guidance_scale?: number;
    flow_shift?: number;
    seed?: number;
    enable_safety_checker?: boolean;
  }) {
    super();
    this.data = { ...params };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/t2v-720p-ultra-fast";
  }

  getModelType(): string {
    return "text-to-video";
  }
}