import { z } from 'zod';
import { BaseRequest } from '../base';

// Helper schema for LoRA weights
const LoraWeightSchema = z.object({
  path: z.string().min(1, { message: 'Path to the LoRA model is required' }).describe('Path to the LoRA model'),
  scale: z.number().min(0.0).max(4.0).describe('Scale of the LoRA model')
});

const Wan21T2v480pLoraUltraFastSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt is required',
  }).describe('The prompt for generating the output.'),
  negative_prompt: z.string().optional().describe('The negative prompt for generating the output.'),
  loras: z.array(LoraWeightSchema).max(3).optional().describe('The LoRA weights for generating the output.'),
  size: z.enum(["832*480", "480*832"]).optional().describe('The size of the output.'),
  num_inference_steps: z.number().int().min(1).max(40).optional().describe('The number of inference steps.'),
  duration: z.number().int().min(5).max(10).optional().describe('Generate video duration length seconds.'),
  guidance_scale: z.number().min(1.01).max(10).optional().describe('The guidance scale for generation.'),
  flow_shift: z.number().min(1).max(10).optional().describe('The shift value for the timestep schedule for flow matching.'),
  seed: z.number().int().optional().describe('The seed for random number generation.'),
  enable_safety_checker: z.boolean().optional().describe('Whether to enable the safety checker.')
});

export class Wan21T2v480pLoraUltraFastRequest extends BaseRequest<typeof Wan21T2v480pLoraUltraFastSchema> {
  protected schema = Wan21T2v480pLoraUltraFastSchema;
  protected data: z.infer<typeof Wan21T2v480pLoraUltraFastSchema>;

  constructor(
    prompt: string,
    negative_prompt?: string,
    loras?: z.infer<typeof LoraWeightSchema>[],
    size?: "832*480" | "480*832",
    num_inference_steps?: number,
    duration?: number,
    guidance_scale?: number,
    flow_shift?: number,
    seed?: number,
    enable_safety_checker?: boolean
  ) {
    super();
    this.data = {
      prompt,
      negative_prompt: negative_prompt ?? "",
      loras: loras ?? [],
      size: size ?? "832*480",
      num_inference_steps: num_inference_steps ?? 30,
      duration: duration ?? 5,
      guidance_scale: guidance_scale ?? 5,
      flow_shift: flow_shift ?? 3,
      seed: seed ?? -1,
      enable_safety_checker: enable_safety_checker ?? true
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/t2v-480p-lora-ultra-fast";
  }

  getModelType(): string {
    return "text-to-video";
  }
}