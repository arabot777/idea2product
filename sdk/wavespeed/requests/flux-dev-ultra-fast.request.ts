import { z } from 'zod';
import { BaseRequest } from '../base';

const FluxDevUltraFastSchema = z.object({
  enable_base64_output: z.boolean().optional().describe('If set to true, the output base64 will be enabled.'),
  enable_safety_checker: z.boolean().optional().describe('If set to true, the safety checker will be enabled.'),
  guidance_scale: z.number().min(0).max(10).optional().describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  image: z.string().optional().describe('The image to generate an image from.'),
  mask_image: z.string().optional().describe('The mask image tells the model where to generate new pixels (white) and where to preserve the original image (black). It acts as a stencil or guide for targeted image editing.'),
  num_images: z.number().int().min(1).max(4).optional().describe('The number of images to generate.'),
  num_inference_steps: z.number().int().min(1).max(50).optional().describe('The number of inference steps to perform.'),
  prompt: z.string().min(1, { message: 'Prompt text is required.' }).describe('The prompt to generate an image from.'),
  seed: z.number().int().optional().describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
  size: z.string().optional().describe('The size of the generated image.'),
  strength: z.number().min(0).max(1).optional().describe('Strength indicates extent to transform the reference image'),
});

export class FluxDevUltraFastRequest extends BaseRequest<typeof FluxDevUltraFastSchema> {
  protected schema = FluxDevUltraFastSchema;
  protected data: z.infer<typeof FluxDevUltraFastSchema>;

  constructor(
    prompt: string,
    image?: string,
    mask_image?: string,
    strength: number = 0.8,
    size: string = "1024*1024",
    num_inference_steps: number = 28,
    seed: number = -1,
    guidance_scale: number = 3.5,
    num_images: number = 1,
    enable_base64_output: boolean = false,
    enable_safety_checker: boolean = true
  ) {
    super();
    this.data = {
      prompt,
      image,
      mask_image,
      strength,
      size,
      num_inference_steps,
      seed,
      guidance_scale,
      num_images,
      enable_base64_output,
      enable_safety_checker,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-dev-ultra-fast";
  }

  getModelType(): string {
    return "text-to-image";
  }

  static getDefaultParams(): Record<string,any> {
    return {
      num_inference_steps: 28,
      num_images: 1,
    }
  }

  static getFeatureCalculator(): string {
    return "num_images";
  }
}