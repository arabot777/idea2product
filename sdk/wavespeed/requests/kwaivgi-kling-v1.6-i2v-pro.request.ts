import { z } from 'zod';
import { BaseRequest } from '../base';

const KwaivgiKlingV16I2vProSchema = z.object({
  duration: z.enum(["5", "10"]).default("5").describe("Generate video duration length seconds.").optional(),
  end_image: z.string().describe("Tail frame of the video; Supported image formats include.jpg/.jpeg/.png; The image file size cannot exceed 10MB, and the image resolution should not be less than 300*300px.").optional(),
  guidance_scale: z.number().min(0).max(1).default(0.5).describe("Flexibility in video generation; The higher the value, the lower the model’s degree of flexibility, and the stronger the relevance to the user’s prompt.").optional(),
  image: z.string().describe("First frame of the video; Supported image formats include.jpg/.jpeg/.png; The image file size cannot exceed 10MB, and the image resolution should not be less than 300*300px, and the aspect ratio of the image should be between 1:2.5 ~ 2.5:1"),
  negative_prompt: z.string().max(2500).describe("Negative text prompt; Cannot exceed 2500 characters").optional(),
  prompt: z.string().max(2000).describe("Text prompt for generation; Positive text prompt; Cannot exceed 2500 characters").optional(),
});

export class KwaivgiKlingV16I2vProRequest extends BaseRequest<typeof KwaivgiKlingV16I2vProSchema> {
  protected schema = KwaivgiKlingV16I2vProSchema;
  
  static create(
    image: string,
    duration?: "5" | "10",
    end_image?: string,
    guidance_scale?: number,
    negative_prompt?: string,
    prompt?: string
  ) {
    const request = new KwaivgiKlingV16I2vProRequest();
    request.data = {
      image,
      ...(duration !== undefined && { duration }),
      ...(end_image !== undefined && { end_image }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(negative_prompt !== undefined && { negative_prompt }),
      ...(prompt !== undefined && { prompt }),
    };
    return request;
  }

  getModelUuid(): string {
    return "kwaivgi/kling-v1.6-i2v-pro";
  }

  getModelType(): string {
    return "image-to-video";
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