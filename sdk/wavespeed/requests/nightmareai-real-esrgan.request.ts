import { z } from 'zod';
import { BaseRequest } from '../base';

const NightmareaiRealEsrganSchema = z.object({
  image: z.string().min(1, { message: 'Image is required' }).describe('Input image'),
  guidance_scale: z.number().min(0).max(10).default(4).optional().describe('Factor to scale image by'),
  face_enhance: z.boolean().default(false).optional().describe('Run GFPGAN face enhancement along with upscaling'),
});

export class NightmareaiRealEsrganRequest extends BaseRequest<typeof NightmareaiRealEsrganSchema> {
  protected schema = NightmareaiRealEsrganSchema;
  protected data: z.infer<typeof NightmareaiRealEsrganSchema>;

  constructor(image: string, guidance_scale?: number, face_enhance?: boolean) {
    super();
    this.data = { image, guidance_scale, face_enhance };
    
  }

  getModelUuid(): string {
    return "nightmareai/real-esrgan";
  }

  getModelType(): string {
    return "image-to-image";
  }
}