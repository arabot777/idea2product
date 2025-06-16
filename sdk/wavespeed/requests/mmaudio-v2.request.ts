import { z } from 'zod';
import { BaseRequest } from '../base';

const MmaudioV2Schema = z.object({
  duration: z.number().int().min(1).max(30).default(8).optional().describe('The duration of the audio to generate.'),
  guidance_scale: z.number().min(0).max(20).default(4.5).optional().describe('The strength of Classifier Free Guidance.'),
  mask_away_clip: z.boolean().default(false).optional().describe('Whether to mask away the clip.'),
  negative_prompt: z.string().default('').optional().describe('The negative prompt to generate the audio for.'),
  num_inference_steps: z.number().int().min(4).max(50).default(25).optional().describe('The number of steps to generate the audio for.'),
  prompt: z.string().describe('The prompt to generate the audio for.'),
  seed: z.number().int().min(0).max(6553500000).default(0).optional().describe('The seed for the random number generator'),
  video: z.string().describe('The URL of the video to generate the audio for.')
});

export class MmaudioV2Request extends BaseRequest<typeof MmaudioV2Schema> {
  protected schema = MmaudioV2Schema;
  
  static create(
    video: string,
    prompt: string,
    negative_prompt?: string,
    seed?: number,
    num_inference_steps?: number,
    duration?: number,
    guidance_scale?: number,
    mask_away_clip?: boolean
  ) {
    const request = new MmaudioV2Request();
    request.data = {
      video,
      prompt,
      ...(negative_prompt !== undefined && { negative_prompt }),
      ...(seed !== undefined && { seed }),
      ...(num_inference_steps !== undefined && { num_inference_steps }),
      ...(duration !== undefined && { duration }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(mask_away_clip !== undefined && { mask_away_clip }),
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/mmaudio-v2";
  }

  getModelType(): string {
    return "video-to-video";
  }

  getDefaultParams(): Record<string,any> {
    return {
      duration: 8,
      num_inference_steps: 25,
    }
  }

  getFeatureCalculator(): string {
    return "1";
  }
}