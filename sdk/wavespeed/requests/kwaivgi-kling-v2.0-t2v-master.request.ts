import { z } from 'zod';
import { BaseRequest } from '../base';

const KwaivgiKlingV20T2vMasterSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt is required for text-to-video generation',
  }).max(2000).describe('Text prompt for generation; Positive text prompt; Cannot exceed 2500 characters'),
  aspect_ratio: z.enum(["16:9", "9:16", "1:1"]).optional().describe('Generated video aspect ratio'),
  negative_prompt: z.string().max(2500).optional().describe('Negative text prompt; Cannot exceed 2500 characters'),
  duration: z.enum(["5", "10"]).optional().describe('Generate video duration length seconds.')
});

export class KwaivgiKlingV20T2vMasterRequest extends BaseRequest<typeof KwaivgiKlingV20T2vMasterSchema> {
  protected schema = KwaivgiKlingV20T2vMasterSchema;
  
  static create(
    prompt: string,
    aspect_ratio?: "16:9" | "9:16" | "1:1",
    negative_prompt?: string,
    duration?: "5" | "10"
  ) {
    const request = new KwaivgiKlingV20T2vMasterRequest();
    request.data = {
      prompt,
      ...(aspect_ratio && { aspect_ratio }),
      ...(negative_prompt && { negative_prompt }),
      ...(duration && { duration }),
    };
    return request;
  }

  getModelUuid(): string {
    return "kwaivgi/kling-v2.0-t2v-master";
  }

  getModelType(): string {
    return "text-to-video";
  }

  getDefaultParams(): Record<string,any> {
    return {
      duration: 5,
    }
  }

  getFeatureCalculator(): string {
    return "duration/5";
  }
}