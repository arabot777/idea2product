import { z } from 'zod';
import { BaseRequest } from '../base';

const Veo2I2vSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt text is required for image-to-video generation',
  }).describe('The text prompt describing how the image should be animated'),
  image: z.string().min(1, {
    message: 'Image URL is required',
  }).max(2083).describe('URL of the input image to animate. Should be 720p or higher resolution.'),
  aspect_ratio: z.enum(["16:9", "9:16"]).optional().describe('The aspect ratio of the generated video'),
  duration: z.enum(["5s", "6s", "7s", "8s"]).optional().describe('The duration of the generated video in seconds')
});

export class Veo2I2vRequest extends BaseRequest<typeof Veo2I2vSchema> {
  protected schema = Veo2I2vSchema;
  protected data: z.infer<typeof Veo2I2vSchema>;

  constructor(
    prompt: string,
    image: string,
    aspect_ratio?: "16:9" | "9:16",
    duration?: "5s" | "6s" | "7s" | "8s"
  ) {
    super();
    this.data = {
      prompt,
      image,
    };
    if (aspect_ratio !== undefined) {
      this.data.aspect_ratio = aspect_ratio;
    }
    if (duration !== undefined) {
      this.data.duration = duration;
    }
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/veo2-i2v";
  }

  getModelType(): string {
    return "image-to-video";
  }

  static getDefaultParams(): Record<string,any> {
    return {
      duration: "5s",
    }
  }

  static getFeatureCalculator(): string {
    return `duration=="5s"?1:duration=="6s"?2:duration=="7s"?3:4`;
  }
}