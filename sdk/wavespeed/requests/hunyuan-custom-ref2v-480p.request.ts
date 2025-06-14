import { z } from 'zod';
import { BaseRequest } from '../base';

const HunyuanCustomRef2v480pSchema = z.object({
  enable_safety_checker: z.boolean().default(true).describe('Whether to enable the safety checker.').optional(),
  flow_shift: z.number().min(1).max(20).default(13).describe('The shift value for the timestep schedule for flow matching.').optional(),
  guidance_scale: z.number().min(1.01).max(10).default(7.5).describe('The guidance scale for generation.').optional(),
  image: z.string().describe('The image for generating the output.'),
  negative_prompt: z.string().default('').describe('The negative prompt for generating the output.').optional(),
  prompt: z.string(),
  seed: z.number().int().default(-1).describe('The seed for random number generation.').optional(),
  size: z.enum(["832*480", "480*832"]).default("832*480").describe('The size of the output.').optional(),
});

export class HunyuanCustomRef2v480pRequest extends BaseRequest<typeof HunyuanCustomRef2v480pSchema> {
  protected schema = HunyuanCustomRef2v480pSchema;
  protected data: z.infer<typeof HunyuanCustomRef2v480pSchema>;

  constructor(
    image: string,
    prompt: string,
    negative_prompt?: string,
    size?: "832*480" | "480*832",
    guidance_scale?: number,
    flow_shift?: number,
    seed?: number,
    enable_safety_checker?: boolean
  ) {
    super();
    this.data = {
      image,
      prompt,
      ...(negative_prompt !== undefined && { negative_prompt }),
      ...(size !== undefined && { size }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(flow_shift !== undefined && { flow_shift }),
      ...(seed !== undefined && { seed }),
      ...(enable_safety_checker !== undefined && { enable_safety_checker }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/hunyuan-custom-ref2v-480p";
  }

  getModelType(): string {
    return "image-to-video";
  }

  static getDefaultParams(): Record<string,any> {
    return {
   
    }
  }

  static getFeatureCalculator(): string {
    return "1";
  }
}