import { z } from 'zod';
import { BaseRequest } from '../base';

const ViduImageToVideo20Schema = z.object({
  duration: z.union([z.literal(4), z.literal(8)]).optional().describe('The number of seconds of duration for the output video. Default to 4 accepted value: 4, 8'),
  image: z.string().describe('An image to be used as the start frame of the generated video. For fields that accept images: Only accepts 1 image; Images Assets can be provided via URLs or Base64 encode; You must use one of the following codecs: PNG, JPEG, JPG, WebP; The aspect ratio of the images must be less than 1:4 or 4:1; All images are limited to 50MB; The length of the base64 decode must be under 50MB, and it must include an appropriate content type string. '),
  movement_amplitude: z.enum(["auto", "small", "medium", "large"]).optional().describe('The movement amplitude of objects in the frame. Defaults to auto, accepted value: auto small medium large'),
  prompt: z.string().max(1500, { message: 'Text prompt must be at most 1500 characters' }).describe('Text prompt: A textual description for video generation, with a maximum length of 1500 characters'),
  seed: z.number().int().min(-1).max(9999999999).optional().describe('The seed to use for generating the video. Random seed: Defaults to a random seed number; Manually set values will override the default random seed.')
});

export class ViduImageToVideo20Request extends BaseRequest<typeof ViduImageToVideo20Schema> {
  protected schema = ViduImageToVideo20Schema;
  
  static create(
    image: string,
    prompt: string,
    duration?: 4 | 8,
    movement_amplitude?: "auto" | "small" | "medium" | "large",
    seed?: number
  ) {
    const request = new ViduImageToVideo20Request();
    request.data = {
      image,
      prompt,
      ...(duration !== undefined && { duration }),
      ...(movement_amplitude !== undefined && { movement_amplitude }),
      ...(seed !== undefined && { seed }),
    };
    return request;
  }

  getModelUuid(): string {
    return "vidu/image-to-video-2.0";
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