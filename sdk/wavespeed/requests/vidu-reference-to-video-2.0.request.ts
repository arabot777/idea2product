import { z } from 'zod';
import { BaseRequest } from '../base';

const ViduReferenceToVideo20Schema = z.object({
  aspect_ratio: z.enum(["16:9", "9:16", "1:1"]).optional().default("16:9").describe("The aspect ratio of the output video. Defaults to 16:9, accepted: 16:9 9:16 1:1."),
  images: z.array(z.string()).min(1).max(3).describe("The model will use the provided images as references to generate a video with consistent subjects. For fields that accept images: Accepts 1 to 3 images; Images Assets can be provided via URLs or Base64 encode; You must use one of the following codecs: PNG, JPEG, JPG, WebP; The dimensions of the images must be at least 128x128 pixels; The aspect ratio of the images must be less than 1:4 or 4:1; All images are limited to 50MB; The length of the base64 decode must be under 50MB, and it must include an appropriate content type string."),
  movement_amplitude: z.enum(["auto", "small", "medium", "large"]).optional().default("auto").describe("The movement amplitude of objects in the frame. Defaults to auto, accepted value: auto, small, medium, large."),
  prompt: z.string().describe("Text prompt: A textual description for video generation, with a maximum length of 1500 characters"),
  seed: z.number().int().optional().default(0).describe("The seed to use for generating the video. Random seed: Defaults to a random seed number; Manually set values will override the default random seed.")
});

export class ViduReferenceToVideo20Request extends BaseRequest<typeof ViduReferenceToVideo20Schema> {
  protected schema = ViduReferenceToVideo20Schema;
  protected data: z.infer<typeof ViduReferenceToVideo20Schema>;

  constructor(
    images: string[],
    prompt: string,
    aspect_ratio?: "16:9" | "9:16" | "1:1",
    movement_amplitude?: "auto" | "small" | "medium" | "large",
    seed?: number
  ) {
    super();
    this.data = {
      images,
      prompt,
      aspect_ratio: aspect_ratio ?? "16:9",
      movement_amplitude: movement_amplitude ?? "auto",
      seed: seed ?? 0,
    };
    
  }

  getModelUuid(): string {
    return "vidu/reference-to-video-2.0";
  }

  getModelType(): string {
    return "image-to-video";
  }

  static getDefaultParams(): Record<string,any> {
    return {
    }
  }

  static getFeatureCalculator(): string {
    return "1";
  }
}