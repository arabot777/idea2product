import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21V2v480pSchema = z.object({
  duration: z.number().int().min(5).max(10).default(5).describe('Generate video duration length seconds.'),
  enable_safety_checker: z.boolean().default(true).describe('Whether to enable the safety checker.'),
  flow_shift: z.number().min(1).max(10).default(3).describe('The shift value for the timestep schedule for flow matching.'),
  guidance_scale: z.number().min(1.01).max(10).default(5).describe('The guidance scale for generation.'),
  negative_prompt: z.string().default('').describe('The negative prompt for generating the output.'),
  num_inference_steps: z.number().int().min(1).max(40).default(30).describe('The number of inference steps.'),
  prompt: z.string().describe('In the heart of a bustling city square, a girl is dancing. The sun is setting, casting a warm golden hue over the cobblestone streets. Streetlights are beginning to flicker on, their soft glow mingling with the last rays of daylight. A gentle breeze carries the scent of freshly baked bread from a nearby bakery, mixing with the faint aroma of blooming flowers from the park across the way. The sounds of laughter and conversation fill the air, punctuated by the occasional honk of a distant car. The girl, with her hair flowing freely and a radiant smile on her face, moves gracefully to the rhythm of an invisible melody, her joyous spirit lifting the mood of everyone around her.'),
  seed: z.number().int().default(-1).describe('The seed for random number generation.'),
  strength: z.number().min(0.1).max(1).default(0.9),
  video: z.string().describe('The video for generating the output.')
});

export class Wan21V2v480pRequest extends BaseRequest<typeof Wan21V2v480pSchema> {
  protected schema = Wan21V2v480pSchema;
  protected data: z.infer<typeof Wan21V2v480pSchema>;

  constructor(
    video: string,
    prompt: string,
    negative_prompt?: string,
    num_inference_steps?: number,
    duration?: number,
    strength?: number,
    guidance_scale?: number,
    flow_shift?: number,
    seed?: number,
    enable_safety_checker?: boolean
  ) {
    super();
    this.data = {
      video,
      prompt,
      negative_prompt: negative_prompt ?? Wan21V2v480pSchema.shape.negative_prompt._def.defaultValue(),
      num_inference_steps: num_inference_steps ?? Wan21V2v480pSchema.shape.num_inference_steps._def.defaultValue(),
      duration: duration ?? Wan21V2v480pSchema.shape.duration._def.defaultValue(),
      strength: strength ?? Wan21V2v480pSchema.shape.strength._def.defaultValue(),
      guidance_scale: guidance_scale ?? Wan21V2v480pSchema.shape.guidance_scale._def.defaultValue(),
      flow_shift: flow_shift ?? Wan21V2v480pSchema.shape.flow_shift._def.defaultValue(),
      seed: seed ?? Wan21V2v480pSchema.shape.seed._def.defaultValue(),
      enable_safety_checker: enable_safety_checker ?? Wan21V2v480pSchema.shape.enable_safety_checker._def.defaultValue()
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/v2v-480p";
  }

  getModelType(): string {
    return "video-to-video";
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