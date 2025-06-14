import { z } from 'zod';
import { BaseRequest } from '../base';

const KwaivgiKlingV20I2vMasterSchema = z.object({
  duration: z.enum(["5", "10"]).optional().describe('Generate video duration length seconds.'),
  end_image: z.string().optional().describe('Tail frame of the video; Supported image formats include.jpg/.jpeg/.png; The image file size cannot exceed 10MB, and the image resolution should not be less than 300*300px.'),
  guidance_scale: z.number().min(0).max(1).optional().describe('Flexibility in video generation; The higher the value, the lower the model’s degree of flexibility, and the stronger the relevance to the user’s prompt.'),
  image: z.string().describe('First frame of the video; Supported image formats include.jpg/.jpeg/.png; The image file size cannot exceed 10MB, and the image resolution should not be less than 300*300px, and the aspect ratio of the image should be between 1:2.5 ~ 2.5:1'),
  negative_prompt: z.string().max(2500).optional().describe('Negative text prompt; Cannot exceed 2500 characters'),
  prompt: z.string().max(2000).optional().describe('Text prompt for generation; Positive text prompt; Cannot exceed 2500 characters'),
});

export class KwaivgiKlingV20I2vMasterRequest extends BaseRequest<typeof KwaivgiKlingV20I2vMasterSchema> {
  protected schema = KwaivgiKlingV20I2vMasterSchema;
  protected data: z.infer<typeof KwaivgiKlingV20I2vMasterSchema>;

  constructor(
    image: string, // Required by input.required
    end_image?: string,
    prompt?: string,
    negative_prompt?: string,
    guidance_scale?: number,
    duration?: "5" | "10"
  ) {
    super();
    this.data = {
      image,
      ...(end_image !== undefined && { end_image }),
      prompt: prompt ?? "Capture a dynamic, high-speed chase scene featuring two motorcycles navigating through a bustling cityscape at night. The camera alternates between close-up shots of the riders' intense expressions, the glowing neon signs of the city, and the sleek lines of the motorcycles as they weave through traffic. The sound of revving engines and the hum of the city create an exhilarating atmosphere.",
      ...(negative_prompt !== undefined && { negative_prompt }),
      guidance_scale: guidance_scale ?? 0.5,
      duration: duration ?? "5",
    };
    
  }

  getModelUuid(): string {
    return "kwaivgi/kling-v2.0-i2v-master";
  }

  getModelType(): string {
    return "text-to-image";
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