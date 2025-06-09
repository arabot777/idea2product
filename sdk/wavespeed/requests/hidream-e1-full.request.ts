import { z } from 'zod';
import { BaseRequest } from '../base';

const HidreamE1FullSchema = z.object({
  prompt: z.string().describe('The prompt to generate an image from.'),
  image: z.string().describe('The image to edit.'),
  seed: z.number().int().min(-1).max(9999999999).optional().describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
  enable_base64_output: z.boolean().optional().describe('If set to true, the output base64 will be enabled.'),
  enable_safety_checker: z.boolean().optional().describe('If set to true, the safety checker will be enabled.'),
});

export class HidreamE1FullRequest extends BaseRequest<typeof HidreamE1FullSchema> {
  protected schema = HidreamE1FullSchema;
  protected data: z.infer<typeof HidreamE1FullSchema>;

  constructor(
    prompt: string,
    image: string,
    seed?: number,
    enable_base64_output?: boolean,
    enable_safety_checker?: boolean
  ) {
    super();
    this.data = {
      prompt,
      image,
      ...(seed !== undefined && { seed }),
      ...(enable_base64_output !== undefined && { enable_base64_output }),
      ...(enable_safety_checker !== undefined && { enable_safety_checker }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/hidream-e1-full";
  }

  getModelType(): string {
    return "image-to-image";
  }
}