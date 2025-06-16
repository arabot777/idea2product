import { z } from 'zod';
import { BaseRequest } from '../base';

const InstantCharacterSchema = z.object({
  prompt: z.string().describe('The prompt to generate an image from.'),
  image: z.string().describe('The image URL to generate an image from. Needs to match the dimensions of the mask.'),
  size: z.string().optional().default('1024*1024').describe('The size of the generated image.'),
  negative_prompt: z.string().optional().default('').describe('The negative prompt to use. Use it to address details that you don\'t want in the image. This could be colors, objects, scenery and even the small details (e.g. moustache, blurry, low resolution).'),
  seed: z.number().int().optional().describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
  guidance_scale: z.number().min(0).max(20).optional().default(3.5).describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  num_inference_steps: z.number().int().min(1).max(50).optional().default(28).describe('The number of inference steps to perform.'),
  num_images: z.number().int().min(1).max(4).optional().default(1).describe('The number of images to generate.'),
  enable_safety_checker: z.boolean().optional().default(true).describe('If set to true, the safety checker will be enabled.'),
});

export class InstantCharacterRequest extends BaseRequest<typeof InstantCharacterSchema> {
  protected schema = InstantCharacterSchema;
  
  static create(
    prompt: string,
    image: string,
    size: string = '1024*1024',
    negative_prompt: string = '',
    seed?: number,
    guidance_scale: number = 3.5,
    num_inference_steps: number = 28,
    num_images: number = 1,
    enable_safety_checker: boolean = true
  ) {
    const request = new InstantCharacterRequest();
    request.data = {
      prompt,
      image,
      size,
      negative_prompt,
      seed,
      guidance_scale,
      num_inference_steps,
      num_images,
      enable_safety_checker,
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/instant-character";
  }

  getModelType(): string {
    return "image-to-image";
  }

  getDefaultParams(): Record<string,any> {
    return {
      num_inference_steps: 28,
      num_images: 1,
    }
  }

  getFeatureCalculator(): string {
    return "num_images";
  }
}