import { z } from 'zod';
import { BaseRequest } from '../base';

const Magi124bSchema = z.object({
  prompt: z.string().min(1, {
    message: 'The text prompt to guide video generation. is required',
  }).describe('The text prompt to guide video generation.'),
  image: z.string().optional().describe('URL of an input image to represent the first frame of the video. If the input image does not match the chosen aspect ratio, it is resized and center cropped.'),
  num_frames: z.number().int().min(96).max(192).optional().describe('Number of frames to generate. Must be between 81 to 100 (inclusive). If the number of frames is greater than 81, the video will be generated with 1.25x more billing units.'),
  frames_per_second: z.number().int().min(5).max(30).optional().describe('Frames per second of the generated video. Must be between 5 to 30.'),
  seed: z.number().int().optional().describe('Random seed for reproducibility. If None, a random seed is chosen.'),
  resolution: z.enum(["480p", "720p"]).optional().describe('Resolution of the generated video (480p or 720p). 480p is 0.5 billing units, and 720p is 1 billing unit.'),
  enable_safety_checker: z.boolean().optional().describe('If set to true, the safety checker will be enabled.'),
  aspect_ratio: z.enum(["auto", "16:9", "9:16", "1:1"]).optional().describe('Aspect ratio of the generated video. If \'auto\', the aspect ratio will be determined automatically based on the input image.')
});

export class Magi124bRequest extends BaseRequest<typeof Magi124bSchema> {
  protected schema = Magi124bSchema;
  protected data: z.infer<typeof Magi124bSchema>;

  constructor(
    prompt: string,
    image?: string,
    num_frames?: number,
    frames_per_second?: number,
    seed?: number,
    resolution?: "480p" | "720p",
    enable_safety_checker?: boolean,
    aspect_ratio?: "auto" | "16:9" | "9:16" | "1:1"
  ) {
    super();
    this.data = {
      prompt,
      ... (image !== undefined && { image }),
      ... (num_frames !== undefined && { num_frames }),
      ... (frames_per_second !== undefined && { frames_per_second }),
      ... (seed !== undefined && { seed }),
      ... (resolution !== undefined && { resolution }),
      ... (enable_safety_checker !== undefined && { enable_safety_checker }),
      ... (aspect_ratio !== undefined && { aspect_ratio }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/magi-1-24b";
  }

  getModelType(): string {
    return "image-to-video";
  }
}