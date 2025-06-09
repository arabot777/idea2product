import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan21V2v720pSchema = z.object({
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

export class Wan21V2v720pRequest extends BaseRequest<typeof Wan21V2v720pSchema> {
  protected schema = Wan21V2v720pSchema;
  protected data: z.infer<typeof Wan21V2v720pSchema>;

  constructor(
    prompt: string,
    video: string,
    duration: number = 5,
    enable_safety_checker: boolean = true,
    flow_shift: number = 3,
    guidance_scale: number = 5,
    negative_prompt: string = '',
    num_inference_steps: number = 30,
    seed: number = -1,
    strength: number = 0.9
  ) {
    super();
    this.data = {
      prompt,
      video,
      duration,
      enable_safety_checker,
      flow_shift,
      guidance_scale,
      negative_prompt,
      num_inference_steps,
      seed,
      strength
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/v2v-720p";
  }

  getModelType(): string {
    return "video-to-video";
  }
}