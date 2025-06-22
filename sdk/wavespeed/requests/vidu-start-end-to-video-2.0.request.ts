import { z } from 'zod';
import { BaseRequest } from '../base';

const ViduStartEndToVideo20Schema = z.object({
  duration: z.union([z.literal(4), z.literal(8)]).default(4).describe('The number of seconds of duration for the output video. Default to 4 accepted value: 4 8'),
  images: z.array(z.string()).min(2, { message: 'Images array must contain at least 2 items' }).max(2, { message: 'Images array must contain at most 2 items' }).describe('Supports input of two images, with the first uploaded image considered as the start frame and the second image as the end frame. The model will use these provided images to generate the video. For fields that accept images: Only accept 2 images; The pixel density of the start frame and end frame should be similar. The pixel of the start frame divided by the end frame should be between 0.8 and 1.25; Images Assets can be provided via URLs or Base64 encode; You must use one of the following codecs: PNG, JPEG, JPG, WebP; The aspect ratio of the images must be less than 1:4 or 4:1; All images are limited to 50MB; The length of the base64 decode must be under 50MB, and it must include an appropriate content type string.'),
  movement_amplitude: z.enum(["auto", "small", "medium", "large"]).default("auto").describe('The movement amplitude of objects in the frame. Defaults to auto, accepted value: auto small medium large.'),
  prompt: z.string().min(1, { message: 'Prompt text is required' }).describe('Text prompt: A textual description for video generation, with a maximum length of 1500 characters.'),
  seed: z.number().default(0).describe('Random seed: Defaults to a random seed number; Manually set values will override the default random seed.')
});

export class ViduStartEndToVideo20Request extends BaseRequest<typeof ViduStartEndToVideo20Schema> {
  protected schema = ViduStartEndToVideo20Schema;
  
  static create(
    prompt: string,
    images: string[],
    duration?: 4 | 8,
    movement_amplitude?: "auto" | "small" | "medium" | "large",
    seed?: number
  ) {
    const request = new ViduStartEndToVideo20Request();
    request.data = {
      prompt,
      images,
      duration: duration ?? 4,
      movement_amplitude: movement_amplitude ?? "auto",
      seed: seed ?? 0,
    };
    return request;
  }

  getModelUuid(): string {
    return "vidu/start-end-to-video-2.0";
  }

  getModelType(): string {
    return "image-to-video";
  }

  getDefaultParams(): Record<string,any> {
    return {
      duration: 4,
    }
  }

  getFeatureCalculator(): string {
    return "duration/4";
  }
}