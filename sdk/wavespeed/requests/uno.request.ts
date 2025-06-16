import { z } from 'zod';
import { BaseRequest } from '../base';

const UnoSchema = z.object({
  images: z.array(z.string()).max(5).describe('URL of images to use while generating the image.'),
  image_size: z.enum(["square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"]).default("square_hd").describe('The aspect ratio of the generated image.'),
  prompt: z.string().describe('The prompt to generate an image from.'),
  seed: z.number().int().optional().describe('Random seed for reproducible generation. If set none, a random seed will be used.'),
  num_images: z.number().int().min(1).max(4).default(1).describe('The number of images to generate.'),
  num_inference_steps: z.number().int().min(1).max(50).default(28).describe('The number of inference steps to perform.'),
  guidance_scale: z.number().min(1).max(20).default(3.5).describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  output_format: z.enum(["jpeg", "png"]).default("jpeg").describe('The format of the generated image.'),
  enable_safety_checker: z.boolean().default(true).describe('If set to true, the safety checker will be enabled.'),
});

export class UnoRequest extends BaseRequest<typeof UnoSchema> {
  protected schema = UnoSchema;
  
  static create(
    images: string[],
    prompt: string,
    image_size: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9" = "square_hd",
    seed?: number,
    num_images: number = 1,
    num_inference_steps: number = 28,
    guidance_scale: number = 3.5,
    output_format: "jpeg" | "png" = "jpeg",
    enable_safety_checker: boolean = true
  ) {
    const request = new UnoRequest();
    request.data = {
      images,
      image_size,
      prompt,
      seed,
      num_images,
      num_inference_steps,
      guidance_scale,
      output_format,
      enable_safety_checker,
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/uno";
  }

  getModelType(): string {
    return "image-to-image";
  }

  getDefaultParams(): Record<string,any> {
    return {
      num_images: 1,
      num_inference_steps: 28,
    }
  }

  getFeatureCalculator(): string {
    return "num_images";
  }
}