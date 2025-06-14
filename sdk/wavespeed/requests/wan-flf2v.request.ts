import { z } from "zod";
import { BaseRequest } from "../base";

const WanFlf2vSchema = z.object({
  prompt: z.string().describe("he text prompt to guide video generation."),
  negative_prompt: z
    .string()
    .optional()
    .default(
      "bright colors, overexposed, static, blurred details, subtitles, style, artwork, painting, picture, still, overall gray, worst quality, low quality, JPEG compression residue, ugly, incomplete, extra fingers, poorly drawn hands, poorly drawn faces, deformed, disfigured, malformed limbs, fused fingers, still picture, cluttered background, three legs, many people in the background, walking backwards"
    )
    .describe("Negative prompt for video generation"),
  start_image: z.string().describe("URL of the starting image. If the input image does not match the chosen aspect ratio, it is resized and center cropped."),
  end_image: z.string().describe("URL of the ending image. If the input image does not match the chosen aspect ratio, it is resized and center cropped."),
  seed: z.number().int().optional().default(-1).describe("Random seed for reproducibility. If None, a random seed is chosen."),
  num_frames: z.number().int().min(81).max(100).optional().default(81).describe("Frames per second of the generated video. Must be between 5 to 24."),
  frames_per_second: z.number().int().min(5).max(24).optional().default(16).describe("Frames per second of the generated video. Must be between 5 to 24. "),
  resolution: z
    .enum(["720p", "480p"])
    .optional()
    .default("720p")
    .describe("Resolution of the generated video (480p or 720p). 480p is 0.5 billing units, and 720p is 1 billing unit."),
  num_inference_steps: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional()
    .default(30)
    .describe("Number of inference steps for sampling. Higher values give better quality but take longer. "),
  guide_scale: z
    .number()
    .min(1.01)
    .max(30)
    .optional()
    .default(5)
    .describe("Classifier-free guidance scale. Higher values give better adherence to the prompt but may decrease quality. "),
  shift: z.number().min(0).max(10).optional().default(2).describe("shift"),
  enable_safety_checker: z.boolean().optional().default(true).describe("If set to true, the safety checker will be enabled."),
  enable_prompt_expansion: z.boolean().optional().default(true).describe("enable_prompt_expansion"),
  aspect_ratio: z
    .enum(["auto", "1:1", "9:16", "16:9"])
    .optional()
    .default("auto")
    .describe("Aspect ratio of the generated video. If 'auto', the aspect ratio will be determined automatically based on the input image."),
});

export class WanFlf2vRequest extends BaseRequest<typeof WanFlf2vSchema> {
  protected schema = WanFlf2vSchema;
  protected data: z.infer<typeof WanFlf2vSchema>;

  constructor(
    prompt: string,
    start_image: string,
    end_image: string,
    negative_prompt?: string,
    seed?: number,
    num_frames?: number,
    frames_per_second?: number,
    resolution?: "720p" | "480p",
    num_inference_steps?: number,
    guide_scale?: number,
    shift?: number,
    enable_safety_checker?: boolean,
    enable_prompt_expansion?: boolean,
    aspect_ratio?: "auto" | "1:1" | "9:16" | "16:9"
  ) {
    super();
    this.data = {
      prompt,
      start_image,
      end_image,
      negative_prompt: negative_prompt ?? WanFlf2vSchema.shape.negative_prompt._def.defaultValue(),
      seed: seed ?? WanFlf2vSchema.shape.seed._def.defaultValue(),
      num_frames: num_frames ?? WanFlf2vSchema.shape.num_frames._def.defaultValue(),
      frames_per_second: frames_per_second ?? WanFlf2vSchema.shape.frames_per_second._def.defaultValue(),
      resolution: resolution ?? WanFlf2vSchema.shape.resolution._def.defaultValue(),
      num_inference_steps: num_inference_steps ?? WanFlf2vSchema.shape.num_inference_steps._def.defaultValue(),
      guide_scale: guide_scale ?? WanFlf2vSchema.shape.guide_scale._def.defaultValue(),
      shift: shift ?? WanFlf2vSchema.shape.shift._def.defaultValue(),
      enable_safety_checker: enable_safety_checker ?? WanFlf2vSchema.shape.enable_safety_checker._def.defaultValue(),
      enable_prompt_expansion: enable_prompt_expansion ?? WanFlf2vSchema.shape.enable_prompt_expansion._def.defaultValue(),
      aspect_ratio: aspect_ratio ?? WanFlf2vSchema.shape.aspect_ratio._def.defaultValue(),
    };
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-flf2v";
  }

  getModelType(): string {
    return "image-to-video";
  }
  static getDefaultParams(): Record<string, any> {
    return {
      num_frames: 81,
      frames_per_second: 16,
      resolution: "720p",
      num_inference_steps: 30,
      shift: 2,
    };
  }

  static getFeatureCalculator(): string {
    return `(num_frames * (resolution === "720p" ? 1 : 0.5))`;
  }
}
