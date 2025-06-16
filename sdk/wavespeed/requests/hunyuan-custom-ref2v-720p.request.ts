import { z } from 'zod';
import { BaseRequest } from '../base';

const HunyuanCustomRef2v720pSchema = z.object({
  enable_safety_checker: z.boolean().default(true).describe('Whether to enable the safety checker.'),
  flow_shift: z.number().min(1).max(20).default(13).describe('The shift value for the timestep schedule for flow matching.'),
  guidance_scale: z.number().min(1.01).max(10).default(7.5).describe('The guidance scale for generation.'),
  image: z.string().describe('The image for generating the output.'),
  negative_prompt: z.string().default("").describe('The negative prompt for generating the output.'),
  prompt: z.string(),
  seed: z.number().int().default(-1).describe('The seed for random number generation.'),
  size: z.enum(["1280*720", "720*1280"]).default("1280*720").describe('The size of the output.')
});

export class HunyuanCustomRef2v720pRequest extends BaseRequest<typeof HunyuanCustomRef2v720pSchema> {
  protected schema = HunyuanCustomRef2v720pSchema;
  
  static create(
    prompt: string,
    image: string,
    options?: {
      enable_safety_checker?: boolean;
      flow_shift?: number;
      guidance_scale?: number;
      negative_prompt?: string;
      seed?: number;
      size?: "1280*720" | "720*1280";
    }
  ) {
    const request = new HunyuanCustomRef2v720pRequest();
    request.data = {
      prompt,
      image,
      enable_safety_checker: options?.enable_safety_checker ?? (typeof HunyuanCustomRef2v720pSchema.shape.enable_safety_checker._def.defaultValue === 'function' ? HunyuanCustomRef2v720pSchema.shape.enable_safety_checker._def.defaultValue() : HunyuanCustomRef2v720pSchema.shape.enable_safety_checker._def.defaultValue),
      flow_shift: options?.flow_shift ?? (typeof HunyuanCustomRef2v720pSchema.shape.flow_shift._def.defaultValue === 'function' ? HunyuanCustomRef2v720pSchema.shape.flow_shift._def.defaultValue() : HunyuanCustomRef2v720pSchema.shape.flow_shift._def.defaultValue),
      guidance_scale: options?.guidance_scale ?? (typeof HunyuanCustomRef2v720pSchema.shape.guidance_scale._def.defaultValue === 'function' ? HunyuanCustomRef2v720pSchema.shape.guidance_scale._def.defaultValue() : HunyuanCustomRef2v720pSchema.shape.guidance_scale._def.defaultValue),
      negative_prompt: options?.negative_prompt ?? (typeof HunyuanCustomRef2v720pSchema.shape.negative_prompt._def.defaultValue === 'function' ? HunyuanCustomRef2v720pSchema.shape.negative_prompt._def.defaultValue() : HunyuanCustomRef2v720pSchema.shape.negative_prompt._def.defaultValue),
      seed: options?.seed ?? (typeof HunyuanCustomRef2v720pSchema.shape.seed._def.defaultValue === 'function' ? HunyuanCustomRef2v720pSchema.shape.seed._def.defaultValue() : HunyuanCustomRef2v720pSchema.shape.seed._def.defaultValue),
      size: options?.size ?? (typeof HunyuanCustomRef2v720pSchema.shape.size._def.defaultValue === 'function' ? HunyuanCustomRef2v720pSchema.shape.size._def.defaultValue() : HunyuanCustomRef2v720pSchema.shape.size._def.defaultValue),
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/hunyuan-custom-ref2v-720p";
  }

  getModelType(): string {
    return "image-to-video";
  }

  getDefaultParams(): Record<string,any> {
    return {
   
    }
  }

  getFeatureCalculator(): string {
    return "1";
  }
}