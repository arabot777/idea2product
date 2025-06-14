import { z } from 'zod';
import { BaseRequest } from '../base';

const DiaTTSSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt text is required for text-to-speech generation',
  }).describe('The text to be converted to speech.')
});

export class DiaTTSRequest extends BaseRequest<typeof DiaTTSSchema> {
  protected schema = DiaTTSSchema;
  protected data: z.infer<typeof DiaTTSSchema>;

  constructor(prompt: string) {
    super();
    this.data = { prompt };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/dia-tts";
  }

  getModelType(): string {
    return "text-to-audio";
  }

  static getDefaultParams(): Record<string,any> {
    return { }
  }

  static getFeatureCalculator(): string {
    return "1";
  }
}
