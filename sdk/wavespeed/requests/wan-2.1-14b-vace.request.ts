import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan2114bVaceSchema = z.object({
  context_scale: z.number().min(0).max(2).optional().default(1).describe(""),
  enable_fast_mode: z.boolean().optional().default(false).describe("using accelerator technology to speed up the model, which may slightly decrease output quality."),
  enable_safety_checker: z.boolean().optional().default(true).describe("Whether to enable the safety checker."),
  flow_shift: z.number().int().min(0).max(30).optional().default(16).describe("The shift value for the timestep schedule for flow matching."),
  guidance_scale: z.number().min(1.01).max(10).optional().default(5).describe("The guidance scale for generation."),
  images: z.array(z.string()).max(5).optional().describe("URL of ref images to use while generating the video."),
  negative_prompt: z.string().optional().default("").describe("The negative prompt for generating the output."),
  num_inference_steps: z.number().int().min(1).max(40).optional().default(30).describe("The number of inference steps."),
  prompt: z.string().min(1, { message: 'prompt is required' }).describe(""),
  seed: z.number().int().optional().default(-1).describe("The seed for random number generation."),
  size: z.enum(["832*480", "480*832", "1280*720", "720*1280"]).optional().default("832*480").describe("The size of the output."),
  task: z.enum(["depth", "pose"]).optional().default("depth").describe("Extract control information from the provided video to guide video generation."),
  video: z.string().optional().default("").describe("The video for generating the output."),
});

export class Wan2114bVaceRequest extends BaseRequest<typeof Wan2114bVaceSchema> {
  protected schema = Wan2114bVaceSchema;
  protected data: z.infer<typeof Wan2114bVaceSchema>;

  constructor(data: z.infer<typeof Wan2114bVaceSchema>) {
    super();
    this.data = data;
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1-14b-vace";
  }

  getModelType(): string {
    return "image-to-video";
  }
}