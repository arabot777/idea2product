import { z } from 'zod';
import { BaseRequest } from '../base';

const FluxKontextMaxSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt is required.' }).describe('The prompt to generate an image from.'),
  image: z.string().min(1, { message: 'Image is required.' }).describe('The image to generate an image from.'),
  seed: z.number().int().min(-1).max(9999999999).optional().describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
  guidance_scale: z.number().min(1.0).max(10.0).optional().describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  enable_safety_checker: z.boolean().optional().describe('If set to true, the safety checker will be enabled.'),
});

export class FluxKontextMaxRequest extends BaseRequest<typeof FluxKontextMaxSchema> {
  protected schema = FluxKontextMaxSchema;
  protected data: z.infer<typeof FluxKontextMaxSchema>;

  constructor(
    prompt: string,
    image: string,
    seed?: number,
    guidance_scale: number = 3.5,
    enable_safety_checker: boolean = true
  ) {
    super();
    this.data = {
      prompt,
      image,
      seed,
      guidance_scale,
      enable_safety_checker,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-kontext-max";
  }

  getModelType(): string {
    return "image-to-image";
  }
}