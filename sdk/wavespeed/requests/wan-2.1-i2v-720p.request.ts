import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21I2v720pSchema = z.object({
  image: z.string().describe('The image for generating the output.'),
  prompt: z.string().describe('The prompt for generating the output.'),
  negative_prompt: z.string().optional().describe('The negative prompt for generating the output.'),
  size: z.enum(["1280*720", "720*1280"]).optional().describe('The size of the output.'),
  num_inference_steps: z.number().int().min(1).max(40).optional().describe('The number of inference steps.'),
  duration: z.number().int().min(5).max(10).optional().describe('Generate video duration length seconds.'),
  guidance_scale: z.number().min(1.01).max(10).optional().describe('The guidance scale for generation.'),
  flow_shift: z.number().min(1).max(10).optional().describe('The shift value for the timestep schedule for flow matching.'),
  seed: z.number().int().optional().describe('The seed for random number generation.'),
  enable_safety_checker: z.boolean().optional().describe('Whether to enable the safety checker.')
});

export class Wan21I2v720pRequest extends BaseRequest<typeof Wan21I2v720pSchema> {
  protected schema = Wan21I2v720pSchema;
  
  static create(
    image: string,
    prompt: string,
    negative_prompt?: string,
    size?: "1280*720" | "720*1280",
    num_inference_steps?: number,
    duration?: number,
    guidance_scale?: number,
    flow_shift?: number,
    seed?: number,
    enable_safety_checker?: boolean
  ) {
    const request = new Wan21I2v720pRequest();
    request.data = {
      image,
      prompt,
      ...(negative_prompt !== undefined && { negative_prompt }),
      ...(size !== undefined && { size }),
      ...(num_inference_steps !== undefined && { num_inference_steps }),
      ...(duration !== undefined && { duration }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(flow_shift !== undefined && { flow_shift }),
      ...(seed !== undefined && { seed }),
      ...(enable_safety_checker !== undefined && { enable_safety_checker }),
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/i2v-720p";
  }

  getModelType(): string {
    return "image-to-video";
  }
  getDefaultParams(): Record<string,any> {
    return {
      num_inference_steps: 30,
      duration: 5,
    }
  }

  getFeatureCalculator(): string {
    return "duration/5";
  }
}