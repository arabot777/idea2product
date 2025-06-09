import { z } from 'zod';
import { BaseRequest } from '../base';

const TestTestModelRequestSchema = z.object({
  enable_base64_output: z.boolean().describe(`If enabled, the output will be encoded into a BASE64 string instead of a URL.`).optional(),
  enable_safety_checker: z.boolean().describe(`If set to true, the safety checker will be enabled.`).optional(),
  enable_sync_mode: z.boolean().describe(`If set to true, the function will wait for the image to be generated and uploaded before returning the response. It allows you to get the image directly in the response.`).optional(),
  guidance_scale: z.number().describe(`The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.`).min(1).max(10).optional(),
  image: z.string().describe(`The image to generate an image from.`).optional(),
  mask_image: z.string().describe(`The mask image tells the model where to generate new pixels (white) and where to preserve the original image (black). It acts as a stencil or guide for targeted image editing.`).optional(),
  num_images: z.number().int().describe(`The number of images to generate.`).min(1).max(4).optional(),
  num_inference_steps: z.number().int().describe(`The number of inference steps to perform.`).min(1).max(50).optional(),
  prompt: z.string().describe(`The prompt to generate an image from.`),
  seed: z.number().int().describe(`
            The same seed and the same prompt given to the same version of the model
            will output the same image every time.
        `).optional(),
  size: z.string().describe(`The size of the generated image.`).optional(),
  strength: z.number().describe(`Strength indicates extent to transform the reference image`).min(0).max(1).optional(),
});

export class TestTestModelRequest extends BaseRequest<typeof TestTestModelRequestSchema> {
  protected schema = TestTestModelRequestSchema;
  protected data: z.infer<typeof TestTestModelRequestSchema>;

  constructor(prompt: string, image?: string, mask_image?: string, strength: number = 0.8, size: string = '1024*1024', num_inference_steps: number = 28, seed: number = -1, guidance_scale: number = 3.5, num_images: number = 1, enable_base64_output: boolean = false, enable_safety_checker: boolean = true, enable_sync_mode: boolean = false) {
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
      enable_sync_mode,
    };
    
  }

  getModelUuid(): string {
    return "test/test-model";
  }

  getModelType(): string {
    return "text-to-image";
  }
}