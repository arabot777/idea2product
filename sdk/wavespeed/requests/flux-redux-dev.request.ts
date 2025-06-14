import { z } from 'zod';
import { BaseRequest } from '../base';

const FluxReduxDevSchema = z.object({
  enable_safety_checker: z.boolean().default(true).optional().describe('If set to true, the safety checker will be enabled.'),
  guidance_scale: z.number().min(1).max(20).default(3.5).optional().describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  image: z.string().describe('The URL of the image to generate an image from.'),
  num_images: z.number().int().min(1).max(4).default(1).optional().describe('The number of images to generate.'),
  num_inference_steps: z.number().int().min(1).max(50).default(28).optional().describe('The number of inference steps to perform.'),
  seed: z.number().int().default(0).optional().describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
  size: z.string().default('1024*1024').optional().describe('The size of the generated image.')
});

export class FluxReduxDevRequest extends BaseRequest<typeof FluxReduxDevSchema> {
  protected schema = FluxReduxDevSchema;
  protected data: z.infer<typeof FluxReduxDevSchema>;

  constructor(
    image: string,
    size: string = '1024*1024',
    num_inference_steps: number = 28,
    seed: number = 0,
    guidance_scale: number = 3.5,
    num_images: number = 1,
    enable_safety_checker: boolean = true
  ) {
    super();
    this.data = {
      image,
      size,
      num_inference_steps,
      seed,
      guidance_scale,
      num_images,
      enable_safety_checker,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-redux-dev";
  }

  getModelType(): string {
    return "image-to-image";
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