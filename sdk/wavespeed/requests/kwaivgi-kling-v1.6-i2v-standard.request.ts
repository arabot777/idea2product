import { z } from 'zod';
import { BaseRequest } from '../base';

const KwaivgiKlingV16I2vStandardSchema = z.object({
  duration: z.enum(['5', '10']).optional().describe('Generate video duration length seconds.'),
  guidance_scale: z.number().min(0).max(1).optional().describe('Flexibility in video generation; The higher the value, the lower the model’s degree of flexibility, and the stronger the relevance to the user’s prompt.'),
  image: z.string().describe('First frame of the video; Supported image formats include.jpg/.jpeg/.png; The image file size cannot exceed 10MB, and the image resolution should not be less than 300*300px'),
  negative_prompt: z.string().max(2500).optional().describe('Negative text prompt; Cannot exceed 2500 characters'),
  prompt: z.string().max(2000).optional().describe('Text prompt for generation; Positive text prompt; Cannot exceed 2500 characters')
});

export class KwaivgiKlingV16I2vStandardRequest extends BaseRequest<typeof KwaivgiKlingV16I2vStandardSchema> {
  protected schema = KwaivgiKlingV16I2vStandardSchema;
  protected data: z.infer<typeof KwaivgiKlingV16I2vStandardSchema>;

  constructor(image: string, prompt?: string, negative_prompt?: string, guidance_scale?: number, duration?: '5' | '10') {
    super();
    this.data = { image, prompt: prompt ?? "The woman driving a red convertible supercar along a scenic Mediterranean coastal road. The video begins with a slow cinematic drone shot from high above, capturing the winding cliffside highway and sparkling ocean below. The drone then swoops down, transitioning into a smooth pan along the car’s body. A close-up reveals the woman’s confident face behind chic sunglasses, her hair flowing in the wind. As the car speeds ahead, the camera follows from behind, revealing the sunlit coastline stretching into the horizon. Golden hour lighting, elegant, aspirational tone, smooth camera motion, cinematic drone transitions", negative_prompt: negative_prompt ?? undefined, guidance_scale: guidance_scale ?? 0.5, duration: duration ?? "5" };
    
  }

  getModelUuid(): string {
    return "kwaivgi/kling-v1.6-i2v-standard";
  }

  getModelType(): string {
    return "image-to-video";
  }

  static getDefaultParams(): Record<string,any> {
    return {
      duration: 5,
    }
  }

  static getFeatureCalculator(): string {
    return "duration/5";
  }
}