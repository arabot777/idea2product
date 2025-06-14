import { z } from 'zod';
import { BaseRequest } from '../base';

const LtxVideoV097I2v720pSchema = z.object({
  image: z.string().describe('Image URL for Image-to-Video task'),
  prompt: z.string().describe('Text prompt to guide generation'),
  negative_prompt: z.string().optional().describe('Negative prompt for generation'),
  size: z.enum(['720*1280', '1280*720']).optional().describe('The size of the output.'),
  seed: z.number().int().min(-1).max(9999999999).optional().describe('Random seed for generation')
});

export class LtxVideoV097I2v720pRequest extends BaseRequest<typeof LtxVideoV097I2v720pSchema> {
  protected schema = LtxVideoV097I2v720pSchema;
  protected data: z.infer<typeof LtxVideoV097I2v720pSchema>;

  constructor(image: string, prompt: string, negative_prompt: string = 'worst quality, inconsistent motion, blurry, jittery, distorted', size: '720*1280' | '1280*720' = '1280*720', seed?: number) {
    super();
    this.data = { image, prompt, negative_prompt, size, seed };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/ltx-video-v097/i2v-720p";
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