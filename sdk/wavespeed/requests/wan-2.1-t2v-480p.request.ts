import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21T2v480pSchema = z.object({
  duration: z.number().int().min(5).max(10).describe('Generate video duration length seconds.'),
  enable_safety_checker: z.boolean().describe('Whether to enable the safety checker.').optional(),
  flow_shift: z.number().min(1).max(10).describe('The shift value for the timestep schedule for flow matching.').optional(),
  guidance_scale: z.number().min(1.01).max(10).describe('The guidance scale for generation.').optional(),
  negative_prompt: z.string().describe('The negative prompt for generating the output.').optional(),
  num_inference_steps: z.number().int().min(0).max(40).describe('The number of inference steps.').optional(),
  prompt: z.string().describe('The prompt for generating the output.'),
  seed: z.number().int().describe('The seed for random number generation.').optional(),
  size: z.enum(['832*480', '480*832']).describe('The size of the output.').optional(),
});

export class Wan21T2v480pRequest extends BaseRequest<typeof Wan21T2v480pSchema> {
  protected schema = Wan21T2v480pSchema;
  
  static create({ prompt, duration, enable_safety_checker, flow_shift, guidance_scale, negative_prompt, num_inference_steps, seed, size }: { prompt: string, duration?: number | undefined, enable_safety_checker?: boolean | undefined, flow_shift?: number | undefined, guidance_scale?: number | undefined, negative_prompt?: string | undefined, num_inference_steps?: number | undefined, seed?: number | undefined, size?: "832*480" | "480*832" | undefined }) {
    const request = new Wan21T2v480pRequest();
    request.data = {
      prompt,
      duration: duration ?? 5,
      enable_safety_checker: enable_safety_checker ?? true,
      flow_shift: flow_shift ?? 3,
      guidance_scale: guidance_scale ?? 5,
      negative_prompt: negative_prompt ?? '',
      num_inference_steps: num_inference_steps ?? 30,
      seed: seed ?? -1,
      size: size ?? '832*480'
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/t2v-480p";
  }

  getModelType(): string {
    return "text-to-video";
  }
  getDefaultParams(): Record<string,any> {
    return {
      duration: 5,
      num_inference_steps: 30,
    }
  }

  getFeatureCalculator(): string {
    return "duration/5";
  }
}