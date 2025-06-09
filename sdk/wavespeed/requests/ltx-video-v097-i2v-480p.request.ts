import { z } from 'zod';
import { BaseRequest } from '../base';

const LtxVideoV097I2v480pSchema = z.object({
  image: z.string().describe('Image URL for Image-to-Video task'),
  prompt: z.string().describe('Text prompt to guide generation'),
  negative_prompt: z.string().optional().describe('Negative prompt for generation'),
  size: z.enum(["832*480", "480*832"]).optional().describe('The size of the output.'),
  seed: z.number().int().min(-1).max(9999999999).optional().describe('Random seed for generation'),
});

export class LtxVideoV097I2v480pRequest extends BaseRequest<typeof LtxVideoV097I2v480pSchema> {
  protected schema = LtxVideoV097I2v480pSchema;
  protected data: z.infer<typeof LtxVideoV097I2v480pSchema>;

  constructor(
    image: string,
    prompt: string,
    negative_prompt?: string,
    size?: "832*480" | "480*832",
    seed?: number
  ) {
    super();
    this.data = {
      image,
      prompt,
      ...(negative_prompt !== undefined && { negative_prompt }),
      ...(size !== undefined && { size }),
      ...(seed !== undefined && { seed }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/ltx-video-v097/i2v-480p";
  }

  getModelType(): string {
    return "image-to-video";
  }
}