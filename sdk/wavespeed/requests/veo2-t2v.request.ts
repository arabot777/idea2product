import { z } from 'zod';
import { BaseRequest } from '../base';

const Veo2T2vSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt text is required for video generation',
  }).describe('The text prompt describing the video you want to generate'),
  aspect_ratio: z.enum(["16:9", "9:16"]).optional().default("16:9").describe('The aspect ratio of the generated video'),
  duration: z.enum(["5s", "6s", "7s", "8s"]).optional().default("5s").describe('The duration of the generated video in seconds'),
});

export class Veo2T2vRequest extends BaseRequest<typeof Veo2T2vSchema> {
  protected schema = Veo2T2vSchema;
  
  static create(
    prompt: string,
    aspect_ratio: "16:9" | "9:16" = "16:9",
    duration: "5s" | "6s" | "7s" | "8s" = "5s"
  ) {
    const request = new Veo2T2vRequest();
    request.data = {
      prompt,
      aspect_ratio,
      duration,
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/veo2_t2v";
  }

  getModelType(): string {
    return "text-to-image";
  }

  getDefaultParams(): Record<string,any> {
    return {
      duration: "5s",
    }
  }

  getFeatureCalculator(): string {
    return `duration=="5s"?1:duration=="6s"?2:duration=="7s"?3:4`;
  }
}