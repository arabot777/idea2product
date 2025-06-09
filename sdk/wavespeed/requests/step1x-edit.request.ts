import { z } from 'zod';
import { BaseRequest } from '../base';

const Step1xEditSchema = z.object({
  enable_safety_checker: z.boolean().optional().default(true).describe('If set to true, the safety checker will be enabled.'),
  guidance_scale: z.number().min(0).max(20).optional().default(4).describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  image: z.string().describe('The image URL to generate an image from. Needs to match the dimensions of the mask.'),
  negative_prompt: z.string().optional().default('').describe('The negative prompt to use. Use it to address details that you don\'t want in the image. This could be colors, objects, scenery and even the small details (e.g. moustache, blurry, low resolution).'),
  num_inference_steps: z.number().int().min(1).max(50).optional().default(30).describe('The number of inference steps to perform.'),
  prompt: z.string().describe('The prompt to generate an image from.'),
  seed: z.number().int().optional().describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
});

export class Step1xEditRequest extends BaseRequest<typeof Step1xEditSchema> {
  protected schema = Step1xEditSchema;
  protected data: z.infer<typeof Step1xEditSchema>;

  constructor(
    prompt: string,
    image: string,
    negative_prompt: string = '',
    seed?: number,
    guidance_scale: number = 4,
    num_inference_steps: number = 30,
    enable_safety_checker: boolean = true
  ) {
    super();
    this.data = {
      prompt,
      image,
      negative_prompt,
      ...(seed !== undefined && { seed }),
      guidance_scale,
      num_inference_steps,
      enable_safety_checker,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/step1x-edit";
  }

  getModelType(): string {
    return "text-to-image";
  }
}