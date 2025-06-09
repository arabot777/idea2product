import { z } from 'zod';
import { BaseRequest } from '../base';

const HidreamI1FullSchema = z.object({
  prompt: z.string().describe('The prompt to generate an image from.'),
  size: z.string().optional().default('1024*1024').describe('The size of the generated image.'),
  seed: z.number().optional().default(-1).describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
  enable_base64_output: z.boolean().optional().default(false).describe('If set to true, the output base64 will be enabled.'),
  enable_safety_checker: z.boolean().optional().default(true).describe('If set to true, the safety checker will be enabled.')
});

export class HidreamI1FullRequest extends BaseRequest<typeof HidreamI1FullSchema> {
  protected schema = HidreamI1FullSchema;
  protected data: z.infer<typeof HidreamI1FullSchema>;

  constructor(
    prompt: string,
    size?: string,
    seed?: number,
    enable_base64_output?: boolean,
    enable_safety_checker?: boolean
  ) {
    super();
    this.data = {
      prompt,
      size: size ?? HidreamI1FullSchema.shape.size.parse(undefined),
      seed: seed ?? HidreamI1FullSchema.shape.seed.parse(undefined),
      enable_base64_output: enable_base64_output ?? HidreamI1FullSchema.shape.enable_base64_output.parse(undefined),
      enable_safety_checker: enable_safety_checker ?? HidreamI1FullSchema.shape.enable_safety_checker.parse(undefined),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/hidream-i1-full";
  }

  getModelType(): string {
    return "text-to-image";
  }
}