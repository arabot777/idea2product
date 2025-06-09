import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().describe('Path to the LoRA model'),
  scale: z.number().min(0.0).max(4.0).describe('Scale of the LoRA model'),
});

const Wan21I2v480pLoraSchema = z.object({
  image: z.string().describe('The image for generating the output.'),
  prompt: z.string().describe('The prompt for generating the output.'),
  negative_prompt: z.string().default("").optional().describe('The negative prompt for generating the output.'),
  loras: z.array(LoraWeightSchema).max(3).default([]).optional().describe('The LoRA weights for generating the output.'),
  size: z.enum(["832*480", "480*832"]).default("832*480").optional().describe('The size of the output.'),
  num_inference_steps: z.number().int().min(1).max(40).default(30).optional().describe('The number of inference steps.'),
  duration: z.number().int().min(5).max(10).default(5).optional().describe('Generate video duration length seconds.'),
  guidance_scale: z.number().min(1.01).max(10).default(5).optional().describe('The guidance scale for generation.'),
  flow_shift: z.number().min(1).max(10).default(3).optional().describe('The shift value for the timestep schedule for flow matching.'),
  seed: z.number().int().default(-1).optional().describe('The seed for random number generation.'),
  enable_safety_checker: z.boolean().default(true).optional().describe('Whether to enable the safety checker.'),
});

export class Wan21I2v480pLoraRequest extends BaseRequest<typeof Wan21I2v480pLoraSchema> {
  protected schema = Wan21I2v480pLoraSchema;
  protected data: z.infer<typeof Wan21I2v480pLoraSchema>;

  constructor(
    image: string,
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
      image,
      prompt,
      ... (negative_prompt !== undefined && { negative_prompt }),
      ... (loras !== undefined && { loras }),
      ... (size !== undefined && { size }),
      ... (num_inference_steps !== undefined && { num_inference_steps }),
      ... (duration !== undefined && { duration }),
      ... (guidance_scale !== undefined && { guidance_scale }),
      ... (flow_shift !== undefined && { flow_shift }),
      ... (seed !== undefined && { seed }),
      ... (enable_safety_checker !== undefined && { enable_safety_checker }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/i2v-480p-lora";
  }

  getModelType(): string {
    return "image-to-video";
  }
}