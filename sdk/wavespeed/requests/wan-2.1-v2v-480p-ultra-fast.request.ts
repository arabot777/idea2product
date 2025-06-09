import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21V2v480pUltraFastRequestSchema = z.object({
  duration: z.number().int().min(5).max(10).optional().describe(`Generate video duration length seconds.`),
  enable_safety_checker: z.boolean().optional().describe(`Whether to enable the safety checker.`),
  flow_shift: z.number().min(1).max(10).optional().describe(`The shift value for the timestep schedule for flow matching.`),
  guidance_scale: z.number().min(1.01).max(10).optional().describe(`The guidance scale for generation.`),
  negative_prompt: z.string().optional().describe(`The negative prompt for generating the output.`),
  num_inference_steps: z.number().int().min(1).max(40).optional().describe(`The number of inference steps.`),
  prompt: z.string().describe(`The text to be converted to speech. Supports speaker tags like [S1], [S2] and non-verbal cues like (laughs)`),
  seed: z.number().int().optional().describe(`The seed for random number generation.`),
  strength: z.number().min(0.1).max(1).optional(),
  video: z.string().describe(`The video for generating the output.`),
});

export class Wan21V2v480pUltraFastRequest extends BaseRequest<typeof Wan21V2v480pUltraFastRequestSchema> {
  protected schema = Wan21V2v480pUltraFastRequestSchema;
  protected data: z.infer<typeof Wan21V2v480pUltraFastRequestSchema>;

  constructor(prompt: string, video: string, duration?: number, enable_safety_checker?: boolean, flow_shift?: number, guidance_scale?: number, negative_prompt?: string, num_inference_steps?: number, seed?: number, strength?: number) {
    super();
    this.data = {
    prompt,
    video,
    duration: duration ?? 5,
    enable_safety_checker: enable_safety_checker ?? true,
    flow_shift: flow_shift ?? 3,
    guidance_scale: guidance_scale ?? 5,
    negative_prompt: negative_prompt ?? "",
    num_inference_steps: num_inference_steps ?? 30,
    seed: seed ?? -1,
    strength: strength ?? 0.9
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/v2v-480p-ultra-fast";
  }

  getModelType(): string {
    return "video-to-video";
  }
}