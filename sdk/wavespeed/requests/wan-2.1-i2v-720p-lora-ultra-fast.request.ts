import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().describe('Path to the LoRA model'),
  scale: z.number().min(0.0).max(4.0).describe('Scale of the LoRA model'),
});

const Wan21I2v720pLoraUltraFastSchema = z.object({
  duration: z.number().int().min(5).max(10).optional().default(5).describe('Generate video duration length seconds.'),
  enable_safety_checker: z.boolean().optional().default(true).describe('Whether to enable the safety checker.'),
  flow_shift: z.number().min(1).max(10).optional().default(5).describe('The shift value for the timestep schedule for flow matching.'),
  guidance_scale: z.number().min(1.01).max(10).optional().default(5).describe('The guidance scale for generation.'),
  image: z.string().describe('The image for generating the output.'),
  loras: z.array(LoraWeightSchema).max(3).optional().default([]).describe('The LoRA weights for generating the output.'),
  negative_prompt: z.string().optional().default('').describe('The negative prompt for generating the output.'),
  num_inference_steps: z.number().int().min(1).max(40).optional().default(30).describe('The number of inference steps.'),
  prompt: z.string().describe('The prompt for generating the output.'),
  seed: z.number().int().optional().default(-1).describe('The seed for random number generation.'),
  size: z.enum(['1280*720', '720*1280']).optional().default('1280*720').describe('The size of the output.'),
});

export class Wan21I2v720pLoraUltraFastRequest extends BaseRequest<typeof Wan21I2v720pLoraUltraFastSchema> {
  protected schema = Wan21I2v720pLoraUltraFastSchema;
  protected data: z.infer<typeof Wan21I2v720pLoraUltraFastSchema>;

  constructor({ image, prompt, negativePrompt, loras, size, numInferenceSteps, duration, guidanceScale, flowShift, seed, enableSafetyChecker }: { image: string, prompt: string, negativePrompt?: string | undefined, loras?: Array<{ path: string; scale: number }> | undefined, size?: "1280*720" | "720*1280" | undefined, numInferenceSteps?: number | undefined, duration?: number | undefined, guidanceScale?: number | undefined, flowShift?: number | undefined, seed?: number | undefined, enableSafetyChecker?: boolean | undefined }) {
    super();
    this.data = {
      image: image,
      prompt: prompt,
      negative_prompt: negativePrompt ?? "",
      loras: loras ?? [],
      size: size ?? "1280*720",
      num_inference_steps: numInferenceSteps ?? 30,
      duration: duration ?? 5,
      guidance_scale: guidanceScale ?? 5,
      flow_shift: flowShift ?? 5,
      seed: seed ?? -1,
      enable_safety_checker: enableSafetyChecker ?? true,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/i2v-720p-lora-ultra-fast";
  }

  getModelType(): string {
    return "image-to-video";
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