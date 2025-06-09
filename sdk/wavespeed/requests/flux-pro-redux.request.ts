import { z } from 'zod';
import { BaseRequest } from '../base';

const FluxProReduxSchema = z.object({
  enable_safety_checker: z.boolean().optional().describe('If set to true, the safety checker will be enabled.'),
  guidance_scale: z.number().min(1).max(5).optional().describe('The CFG (Classifier Free Guidance) scale is a measure of how close you want the model to stick to your prompt when looking for a related image to show you.'),
  image: z.string().url().describe('The URL of the image to generate an image from.'),
  num_images: z.number().int().min(1).max(4).optional().describe('The number of images to generate.'),
  num_inference_steps: z.number().int().min(1).max(50).optional().describe('The number of inference steps to perform.'),
  prompt: z.string().optional().describe('The prompt to generate an image from.'),
  seed: z.number().int().min(-1).max(9999999999).optional().describe('The same seed and the same prompt given to the same version of the model will output the same image every time.'),
  size: z.string().optional().describe('The size of the generated image.')
});

export class FluxProReduxRequest extends BaseRequest<typeof FluxProReduxSchema> {
  protected schema = FluxProReduxSchema;
  protected data: z.infer<typeof FluxProReduxSchema>;

  constructor(
    image: string,
    prompt?: string,
    size?: string,
    seed?: number,
    numInferenceSteps?: number,
    guidanceScale?: number,
    numImages?: number,
    enableSafetyChecker?: boolean
  ) {
    super();
    this.data = {
      image,
      ...(prompt !== undefined && { prompt }),
      ...(size !== undefined && { size }),
      ...(seed !== undefined && { seed }),
      ...(numInferenceSteps !== undefined && { num_inference_steps: numInferenceSteps }),
      ...(guidanceScale !== undefined && { guidance_scale: guidanceScale }),
      ...(numImages !== undefined && { num_images: numImages }),
      ...(enableSafetyChecker !== undefined && { enable_safety_checker: enableSafetyChecker }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-pro-redux";
  }

  getModelType(): string {
    return "image-to-image";
  }
}