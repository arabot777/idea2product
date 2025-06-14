import { z } from 'zod';
import { BaseRequest } from '../base';

const FluxKontextMaxTextToImageSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt text is required for image generation',
  }).describe('The prompt to generate an image from.'),
  aspect_ratio: z.enum(["21:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16", "9:21"]).optional().describe('The aspect ratio of the generated image.'),
  guidance_scale: z.number().min(1).max(10).optional().describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  num_images: z.number().int().min(1).max(4).optional().describe('The number of images to generate.'),
  safety_tolerance: z.enum(["1", "2", "3", "4", "5"]).optional().describe('The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive.'),
  seed: z.number().int().min(-1).max(9999999999).optional().describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
});

export class FluxKontextMaxTextToImageRequest extends BaseRequest<typeof FluxKontextMaxTextToImageSchema> {
  protected schema = FluxKontextMaxTextToImageSchema;
  protected data: z.infer<typeof FluxKontextMaxTextToImageSchema>;

  constructor(
    prompt: string,
    aspect_ratio?: "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "2:3" | "3:4" | "9:16" | "9:21",
    num_images?: number,
    seed?: number,
    guidance_scale?: number,
    safety_tolerance?: "1" | "2" | "3" | "4" | "5"
  ) {
    super();
    this.data = {
      prompt,
      aspect_ratio,
      num_images,
      seed,
      guidance_scale,
      safety_tolerance,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-kontext-max/text-to-image";
  }

  getModelType(): string {
    return "text-to-image";
  }

  static getDefaultParams(): Record<string,any> {
    return {
      num_images: undefined,
    }
  }

  static getFeatureCalculator(): string {
    return "num_images";
  }
}