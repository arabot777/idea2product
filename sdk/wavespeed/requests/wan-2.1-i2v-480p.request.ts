import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21I2v480pSchema = z.object({
  image: z.string().describe('The image for generating the output.'),
  prompt: z.string().describe('The prompt for generating the output.'),
  negative_prompt: z.string().optional().describe('The negative prompt for generating the output.'),
  size: z.enum(["832*480", "480*832"]).optional().describe('The size of the output.'),
  num_inference_steps: z.number().int().min(1).max(40).optional().describe('The number of inference steps.'),
  duration: z.number().int().min(5).max(10).optional().describe('Generate video duration length seconds.'),
  guidance_scale: z.number().min(1.01).max(10).optional().describe('The guidance scale for generation.'),
  flow_shift: z.number().min(1).max(10).optional().describe('The shift value for the timestep schedule for flow matching.'),
  seed: z.number().int().optional().describe('The seed for random number generation.'),
  enable_safety_checker: z.boolean().optional().describe('Whether to enable the safety checker.')
});

export class Wan21I2v480pRequest extends BaseRequest<typeof Wan21I2v480pSchema> {
  protected schema = Wan21I2v480pSchema;
  protected data: z.infer<typeof Wan21I2v480pSchema>;

  constructor(
    image: string,
    prompt: string,
    negative_prompt: string = "",
    size: "832*480" | "480*832" = "832*480",
    num_inference_steps: number = 30,
    duration: number = 5,
    guidance_scale: number = 5,
    flow_shift: number = 3,
    seed: number = -1,
    enable_safety_checker: boolean = true
  ) {
    super();
    this.data = {
      image,
      prompt,
      negative_prompt,
      size,
      num_inference_steps,
      duration,
      guidance_scale,
      flow_shift,
      seed,
      enable_safety_checker
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/i2v-480p";
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