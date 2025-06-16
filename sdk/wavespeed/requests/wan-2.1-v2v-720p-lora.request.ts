import { z } from "zod";
import { BaseRequest } from "../base";

const LoraWeightSchema = z.object({
  path: z.string().describe("Path to the LoRA model"),
  scale: z.number().min(0.0).max(4.0).describe("Scale of the LoRA model"),
});

const Wan21V2v720pLoraSchema = z.object({
  video: z.string().describe("The video for generating the output."),
  prompt: z.string().describe("The prompt for generating the output."),
  loras: z
    .array(LoraWeightSchema)
    .max(3)
    .default([{ path: "motimalu/wan-flat-color-v2", scale: 1 }])
    .optional()
    .describe("The LoRA weights for generating the output."),
  negative_prompt: z.string().default("").optional().describe("The negative prompt for generating the output."),
  num_inference_steps: z.number().int().min(1).max(40).default(30).optional().describe("The number of inference steps."),
  duration: z.number().int().min(5).max(10).step(5).default(5).optional().describe("Generate video duration length seconds."),
  strength: z.number().min(0.1).max(1).step(0.01).default(0.9).optional().describe("The strength of the output."),
  guidance_scale: z.number().min(1.01).max(10).step(0.01).default(5).optional().describe("The guidance scale for generation."),
  flow_shift: z.number().min(1).max(10).step(0.1).default(3).optional().describe("The shift value for the timestep schedule for flow matching."),
  seed: z.number().int().default(-1).optional().describe("The seed for random number generation."),
  enable_safety_checker: z.boolean().default(true).optional().describe("Whether to enable the safety checker."),
});

export class Wan21V2v720pLoraRequest extends BaseRequest<typeof Wan21V2v720pLoraSchema> {
  protected schema = Wan21V2v720pLoraSchema;

  static create(
    video: string,
    prompt: string,
    loras?: Array<z.infer<typeof LoraWeightSchema>>,
    negative_prompt?: string,
    num_inference_steps?: number,
    duration?: number,
    strength?: number,
    guidance_scale?: number,
    flow_shift?: number,
    seed?: number,
    enable_safety_checker?: boolean
  ) {
    const request = new Wan21V2v720pLoraRequest();
    request.data = {
      video,
      prompt,
      ...(loras !== undefined && { loras }),
      ...(negative_prompt !== undefined && { negative_prompt }),
      ...(num_inference_steps !== undefined && { num_inference_steps }),
      ...(duration !== undefined && { duration }),
      ...(strength !== undefined && { strength }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(flow_shift !== undefined && { flow_shift }),
      ...(seed !== undefined && { seed }),
      ...(enable_safety_checker !== undefined && { enable_safety_checker }),
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/v2v-720p-lora";
  }

  getModelType(): string {
    return "video-to-video";
  }
  getDefaultParams(): Record<string, any> {
    return {
      duration: 5,
      num_inference_steps: 30,
    };
  }

  getFeatureCalculator(): string {
    return "duration/5";
  }
}
