import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().min(1, {
    message: 'Path to the LoRA model is required',
  }).describe('Path to the LoRA model'),
  scale: z.number().min(0.0).max(4.0).describe('Scale of the LoRA model')
});

const Wan21I2v480pLoraUltraFastSchema = z.object({
  duration: z.number().int().min(5).max(10).optional().describe('Generate video duration length seconds.'),
  enable_safety_checker: z.boolean().optional().describe('Whether to enable the safety checker.'),
  flow_shift: z.number().min(1).max(10).optional().describe('The shift value for the timestep schedule for flow matching.'),
  guidance_scale: z.number().min(1.01).max(10).optional().describe('The guidance scale for generation.'),
  image: z.string().url({
    message: 'Image URL is required and must be a valid URL',
  }).describe('The image for generating the output.'),
  loras: z.array(LoraWeightSchema).max(3).optional().describe('The LoRA weights for generating the output.'),
  negative_prompt: z.string().optional().describe('The negative prompt for generating the output.'),
  num_inference_steps: z.number().int().min(1).max(40).optional().describe('The number of inference steps.'),
  prompt: z.string().min(1, {
    message: 'Prompt text is required',
  }).describe('The prompt for generating the output.'),
  seed: z.number().int().min(-1).max(9999999999).optional().describe('The seed for random number generation.'),
  size: z.enum(["832*480", "480*832"]).optional().describe('The size of the output.')
});

export class Wan21I2v480pLoraUltraFastRequest extends BaseRequest<typeof Wan21I2v480pLoraUltraFastSchema> {
  protected schema = Wan21I2v480pLoraUltraFastSchema;
  protected data: z.infer<typeof Wan21I2v480pLoraUltraFastSchema>;

  constructor(
    image: string,
    prompt: string,
    negative_prompt?: string,
    loras?: Array<{ path: string; scale: number }>,
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
      negative_prompt: negative_prompt ?? "",
      loras: loras ?? [{ path: "Remade-AI/Rotate", scale: 1 }],
      size: size ?? "832*480",
      num_inference_steps: num_inference_steps ?? 30,
      duration: duration ?? 5,
      guidance_scale: guidance_scale ?? 5,
      flow_shift: flow_shift ?? 3,
      seed: seed ?? -1,
      enable_safety_checker: enable_safety_checker ?? true,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/i2v-480p-lora-ultra-fast";
  }

  getModelType(): string {
    return "image-to-video";
  }
  static getDefaultParams(): Record<string,any> {
    return {
      num_inference_steps: 30,
      duration: 5,
    }
  }

  static getFeatureCalculator(): string {
    return "duration/5";
  }
}