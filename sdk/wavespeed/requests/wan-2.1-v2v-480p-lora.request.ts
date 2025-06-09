import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().describe("Path to the LoRA model"),
  scale: z.number().min(0.0).max(4.0).describe("Scale of the LoRA model"),
});

const Wan21V2v480pLoraSchema = z.object({
  duration: z.number().int().min(5).max(10).default(5).describe("Generate video duration length seconds."),
  enable_safety_checker: z.boolean().default(true).describe("Whether to enable the safety checker."),
  flow_shift: z.number().min(1).max(10).default(3).describe("The shift value for the timestep schedule for flow matching."),
  guidance_scale: z.number().min(1.01).max(10).default(5).describe("The guidance scale for generation."),
  loras: z.array(LoraWeightSchema).max(3).default([{"path":"motimalu/wan-flat-color-v2","scale":1}]).describe("The LoRA weights for generating the output."),
  negative_prompt: z.string().default("").describe("The negative prompt for generating the output."),
  num_inference_steps: z.number().int().min(1).max(40).default(30).describe("The number of inference steps."),
  prompt: z.string().min(1, { message: 'prompt is required' }).describe("The text to be converted to speech. Supports speaker tags like [S1], [S2] and non-verbal cues like (laughs)"),
  seed: z.number().int().default(-1).describe("The seed for random number generation."),
  strength: z.number().min(0.1).max(1).default(0.9),
  video: z.string().min(1, { message: 'video is required' }).describe("The video for generating the output."),
});

export class Wan21V2v480pLoraRequest extends BaseRequest<typeof Wan21V2v480pLoraSchema> {
  protected schema = Wan21V2v480pLoraSchema;
  protected data: z.infer<typeof Wan21V2v480pLoraSchema>;

  constructor(
    prompt: string,
    video: string,
    duration?: number,
    enable_safety_checker?: boolean,
    flow_shift?: number,
    guidance_scale?: number,
    loras?: Array<{ path: string; scale: number }>,
    negative_prompt?: string,
    num_inference_steps?: number,
    seed?: number,
    strength?: number
  ) {
    super();
    this.data = {
      prompt,
      video,
      duration: duration ?? Wan21V2v480pLoraSchema.shape.duration._def.defaultValue(),
      enable_safety_checker: enable_safety_checker ?? Wan21V2v480pLoraSchema.shape.enable_safety_checker._def.defaultValue(),
      flow_shift: flow_shift ?? Wan21V2v480pLoraSchema.shape.flow_shift._def.defaultValue(),
      guidance_scale: guidance_scale ?? Wan21V2v480pLoraSchema.shape.guidance_scale._def.defaultValue(),
      loras: loras ?? Wan21V2v480pLoraSchema.shape.loras._def.defaultValue(),
      negative_prompt: negative_prompt ?? Wan21V2v480pLoraSchema.shape.negative_prompt._def.defaultValue(),
      num_inference_steps: num_inference_steps ?? Wan21V2v480pLoraSchema.shape.num_inference_steps._def.defaultValue(),
      seed: seed ?? Wan21V2v480pLoraSchema.shape.seed._def.defaultValue(),
      strength: strength ?? Wan21V2v480pLoraSchema.shape.strength._def.defaultValue(),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/v2v-480p-lora";
  }

  getModelType(): string {
    return "video-to-video";
  }
}