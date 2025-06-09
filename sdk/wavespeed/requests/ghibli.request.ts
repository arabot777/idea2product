import { z } from 'zod';
import { BaseRequest } from '../base';

const GhibliSchema = z.object({
  image: z.string().describe('The image to generate an image from.'),
  enable_base64_output: z.boolean().optional().describe('If enabled, the output will be encoded into a BASE64 string instead of a URL.'),
  enable_safety_checker: z.boolean().optional().describe('If set to true, the safety checker will be enabled.')
});

export class GhibliRequest extends BaseRequest<typeof GhibliSchema> {
  protected schema = GhibliSchema;
  protected data: z.infer<typeof GhibliSchema>;

  constructor(
    image: string,
    enable_base64_output?: boolean,
    enable_safety_checker?: boolean
  ) {
    super();
    this.data = {
      image,
      enable_base64_output: enable_base64_output ?? false,
      enable_safety_checker: enable_safety_checker ?? true
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/ghibli";
  }

  getModelType(): string {
    return "image-to-image";
  }
}