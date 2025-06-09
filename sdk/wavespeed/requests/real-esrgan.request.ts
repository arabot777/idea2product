import { z } from 'zod';
import { BaseRequest } from '../base';

const RealEsrganSchema = z.object({
  face_enhance: z.boolean().default(false).describe('Run GFPGAN face enhancement along with upscaling'),
  guidance_scale: z.number().min(0).max(10).default(4).describe('Factor to scale image by'),
  image: z.string().describe('Input image'),
});

export class RealEsrganRequest extends BaseRequest<typeof RealEsrganSchema> {
  protected schema = RealEsrganSchema;
  protected data: z.infer<typeof RealEsrganSchema>;

  constructor(
    image: string,
    guidance_scale?: number,
    face_enhance?: boolean
  ) {
    super();
    this.data = {
      image,
      guidance_scale: guidance_scale ?? 4,
      face_enhance: face_enhance ?? false,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/real-esrgan";
  }

  getModelType(): string {
    return "image-to-image";
  }
}