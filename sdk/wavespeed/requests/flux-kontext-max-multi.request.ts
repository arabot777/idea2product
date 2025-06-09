import { z } from 'zod';
import { BaseRequest } from '../base';

const FluxKontextMaxMultiSchema = z.object({
  prompt: z.string().describe('The prompt to generate an image from.'),
  images: z.array(z.string()).max(5).describe('URL of images to use while generating the image.'),
  seed: z.number().int().optional().describe('\n            The same seed and the same prompt given to the same version of the model\n            will output the same image every time.\n        '),
  guidance_scale: z.number().min(1).max(10).default(3.5).optional().describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  safety_tolerance: z.enum(["1", "2", "3", "4", "5"]).default("2").optional().describe('The safety tolerance level for the generated image. 1 being the most strict and 5 being the most permissive.'),
});

export class FluxKontextMaxMultiRequest extends BaseRequest<typeof FluxKontextMaxMultiSchema> {
  protected schema = FluxKontextMaxMultiSchema;
  protected data: z.infer<typeof FluxKontextMaxMultiSchema>;

  constructor(
    prompt: string,
    images: string[],
    seed?: number,
    guidance_scale?: number,
    safety_tolerance?: "1" | "2" | "3" | "4" | "5"
  ) {
    super();
    this.data = {
      prompt,
      images,
      ... (seed !== undefined && { seed }),
      ... (guidance_scale !== undefined && { guidance_scale }),
      ... (safety_tolerance !== undefined && { safety_tolerance }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-kontext-max/multi";
  }

  getModelType(): string {
    return "image-to-image";
  }
}