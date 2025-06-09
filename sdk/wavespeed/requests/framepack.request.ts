import { z } from 'zod';
import { BaseRequest } from '../base';

const FramepackSchema = z.object({
  aspect_ratio: z.enum(["16:9", "9:16"]).optional().default("16:9").describe("The aspect ratio of the video to generate."),
  enable_safety_checker: z.boolean().optional().default(true).describe("If set to true, the safety checker will be enabled."),
  guidance_scale: z.number().min(0).max(32).optional().default(10).describe("Guidance scale for the generation."),
  image: z.string().describe("The URL of the video to generate the audio for."),
  negative_prompt: z.string().optional().default("").describe("The negative prompt to generate the audio for."),
  num_frames: z.number().int().min(30).max(1800).optional().default(180).describe("The duration of the audio to generate."),
  num_inference_steps: z.number().int().min(4).max(50).optional().default(25).describe("The number of steps to generate the audio for."),
  prompt: z.string().describe("Prompt for generating video"),
  resolution: z.enum(["720p", "480p"]).optional().default("720p").describe("The resolution of the video to generate. 720p generations cost 1.5x more than 480p generations."),
  seed: z.number().int().min(0).max(6553500000).optional().default(0).describe("The seed for the random number generator")
});

export class FramepackRequest extends BaseRequest<typeof FramepackSchema> {
  protected schema = FramepackSchema;
  protected data: z.infer<typeof FramepackSchema>;

  constructor(
    image: string,
    prompt: string,
    negative_prompt?: string,
    aspect_ratio?: "16:9" | "9:16",
    resolution?: "720p" | "480p",
    seed?: number,
    num_inference_steps?: number,
    num_frames?: number,
    guidance_scale?: number,
    enable_safety_checker?: boolean
  ) {
    super();
    const rawData = {
      image,
      prompt,
      negative_prompt,
      aspect_ratio,
      resolution,
      seed,
      num_inference_steps,
      num_frames,
      guidance_scale,
      enable_safety_checker,
    };
    this.data = this.schema.parse(rawData);
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/framepack";
  }

  getModelType(): string {
    return "image-to-video";
  }
}