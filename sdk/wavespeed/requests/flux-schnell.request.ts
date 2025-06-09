import { z } from 'zod';
import { BaseRequest } from '../base';

const FluxSchnellSchema = z.object({
  prompt: z.string().describe("Input prompt for image generation").min(1, { message: 'prompt is required' }),
  image: z.string().describe("").optional(),
  mask_image: z.string().describe("The mask image tells the model where to generate new pixels (white) and where to preserve the original image (black). It acts as a stencil or guide for targeted image editing.").optional(),
  strength: z.number().min(0).max(1).describe("Strength indicates extent to transform the reference image").optional().default(0.8),
  size: z.string().describe("Output image size").optional().default("1024*1024"),
  num_inference_steps: z.number().int().min(1).max(8).describe("Number of inference steps").optional().default(4),
  guidance_scale: z.number().min(0).max(10).describe("The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.").optional().default(3.5),
  num_images: z.number().int().min(1).max(4).describe("Number of images to generate").optional().default(1),
  seed: z.number().int().describe("Random seed (-1 for random)").optional().default(-1),
  enable_base64_output: z.boolean().describe("If enabled, the output will be encoded into a BASE64 string instead of a URL.").optional().default(false),
  enable_safety_checker: z.boolean().describe("Enable safety checker").optional().default(true),
  enable_sync_mode: z.boolean().describe("If set to true, the function will wait for the image to be generated and uploaded before returning the response. It allows you to get the image directly in the response.").optional().default(false),
});

export class FluxSchnellRequest extends BaseRequest<typeof FluxSchnellSchema> {
  protected schema = FluxSchnellSchema;
  protected data: z.infer<typeof FluxSchnellSchema>;

  constructor(
    prompt: string,
    image?: string,
    mask_image?: string,
    strength?: number,
    size?: string,
    num_inference_steps?: number,
    guidance_scale?: number,
    num_images?: number,
    seed?: number,
    enable_base64_output?: boolean,
    enable_safety_checker?: boolean,
    enable_sync_mode?: boolean,
  ) {
    super();
    this.data = {
      prompt,
      image: image ?? "",
      mask_image,
      strength: strength ?? 0.8,
      size: size ?? "1024*1024",
      num_inference_steps: num_inference_steps ?? 4,
      guidance_scale: guidance_scale ?? 3.5,
      num_images: num_images ?? 1,
      seed: seed ?? -1,
      enable_base64_output: enable_base64_output ?? false,
      enable_safety_checker: enable_safety_checker ?? true,
      enable_sync_mode: enable_sync_mode ?? false,
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-schnell";
  }

  getModelType(): string {
    return "text-to-image";
  }
}