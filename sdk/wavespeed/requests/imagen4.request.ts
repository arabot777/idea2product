import { z } from 'zod';
import { BaseRequest } from '../base';

const Imagen4Schema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt text is required',
  }).describe('The text prompt describing what you want to see'),
  negative_prompt: z.string().default("").describe('A description of what to discourage in the generated images'),
  aspect_ratio: z.enum(["1:1", "16:9", "9:16", "3:4", "4:3"]).default("1:1").describe('The aspect ratio of the generated image'),
  num_images: z.number().int().min(1).max(4).default(1).describe('Number of images to generate (1-4)'),
  seed: z.number().int().optional().describe('Random seed for reproducible generation'),
});

interface Imagen4RequestParams {
  prompt: string;
  negative_prompt?: string;
  aspect_ratio?: "1:1" | "16:9" | "9:16" | "3:4" | "4:3";
  num_images?: number;
  seed?: number;
}

export class Imagen4Request extends BaseRequest<typeof Imagen4Schema> {
  protected schema = Imagen4Schema;
  protected data: z.infer<typeof Imagen4Schema>;

  constructor(params: Imagen4RequestParams) {
    super();
    this.data = {
      prompt: params.prompt,
      negative_prompt: params.negative_prompt ?? "",
      aspect_ratio: params.aspect_ratio ?? "1:1",
      num_images: params.num_images ?? 1,
      ...(params.seed !== undefined && { seed: params.seed }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/imagen4";
  }

  getModelType(): string {
    return "text-to-image";
  }
}