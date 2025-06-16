import { z } from 'zod';
import { BaseRequest } from '../base';

const HidreamI1DevSchema = z.object({
  enable_base64_output: z.boolean().optional().default(false).describe('If set to true, the output base64 will be enabled.'),
  enable_safety_checker: z.boolean().optional().default(true).describe('If set to true, the safety checker will be enabled.'),
  prompt: z.string().min(1, {
    message: 'Prompt text is required for image generation.',
  }).describe('The prompt to generate an image from.'),
  seed: z.number().int().min(-1).max(9999999999).optional().default(-1).describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
  size: z.string().optional().default("1024*1024").describe('The size of the generated image.')
});

export class HidreamI1DevRequest extends BaseRequest<typeof HidreamI1DevSchema> {
  protected schema = HidreamI1DevSchema;
  
  static create(
    prompt: string,
    size: string = "1024*1024",
    seed: number = -1,
    enable_base64_output: boolean = false,
    enable_safety_checker: boolean = true
  ) {
    const request = new HidreamI1DevRequest();
    request.data = {
      prompt,
      size,
      seed,
      enable_base64_output,
      enable_safety_checker
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/hidream-i1-dev";
  }

  getModelType(): string {
    return "text-to-image";
  }

  getDefaultParams(): Record<string,any> {
    return {
  
    }
  }

  getFeatureCalculator(): string {
    return "1";
  }
}