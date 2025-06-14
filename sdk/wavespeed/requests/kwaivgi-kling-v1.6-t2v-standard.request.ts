import { z } from 'zod';
import { BaseRequest } from '../base';

const KwaivgiKlingV16T2vStandardSchema = z.object({
  prompt: z.string().max(2000, { message: 'Prompt cannot exceed 2000 characters' }).describe('Text prompt for generation; Positive text prompt; Cannot exceed 2500 characters'),
  negative_prompt: z.string().max(2500, { message: 'Negative prompt cannot exceed 2500 characters' }).optional().describe('Negative text prompt; Cannot exceed 2500 characters'),
  guidance_scale: z.number().min(0).max(1).optional().describe('Flexibility in video generation; The higher the value, the lower the model’s degree of flexibility, and the stronger the relevance to the user’s prompt.'),
  duration: z.enum(["5", "10"]).optional().describe('Generate video duration length seconds.')
});

export class KwaivgiKlingV16T2vStandardRequest extends BaseRequest<typeof KwaivgiKlingV16T2vStandardSchema> {
  protected schema = KwaivgiKlingV16T2vStandardSchema;
  protected data: z.infer<typeof KwaivgiKlingV16T2vStandardSchema>;

  constructor(
    prompt: string,
    negative_prompt?: string,
    guidance_scale?: number,
    duration?: "5" | "10"
  ) {
    super();
    this.data = {
      prompt,
      ... (negative_prompt !== undefined && { negative_prompt }),
      ... (guidance_scale !== undefined && { guidance_scale }),
      ... (duration !== undefined && { duration }),
    };
    
  }

  getModelUuid(): string {
    return "kwaivgi/kling-v1.6-t2v-standard";
  }

  getModelType(): string {
    return "text-to-video";
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