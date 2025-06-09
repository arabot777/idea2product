import { z } from 'zod';
import { BaseRequest } from '../base';

const LoraWeightSchema = z.object({
  path: z.string().describe("Path to the LoRA model"),
  scale: z.number().min(0.0).max(4.0).describe("Scale of the LoRA model"),
});

const Wan21T2v480pLoraSchema = z.object({
  prompt: z.string().describe("The prompt for generating the output."),
  duration: z.number().int().min(5).max(10).optional().describe("Generate video duration length seconds."),
  enable_safety_checker: z.boolean().optional().describe("Whether to enable the safety checker."),
  flow_shift: z.number().min(1).max(10).optional().describe("The shift value for the timestep schedule for flow matching."),
  guidance_scale: z.number().min(1.01).max(10).optional().describe("The guidance scale for generation."),
  loras: z.array(LoraWeightSchema).max(3).optional().describe("The LoRA weights for generating the output."),
  negative_prompt: z.string().optional().describe("The negative prompt for generating the output."),
  num_inference_steps: z.number().int().min(1).max(40).optional().describe("The number of inference steps."),
  seed: z.number().int().optional().describe("The seed for random number generation."),
  size: z.enum(["832*480", "480*832"]).optional().describe("The size of the output."),
});

export class Wan21T2v480pLoraRequest extends BaseRequest<typeof Wan21T2v480pLoraSchema> {
  protected schema = Wan21T2v480pLoraSchema;
  protected data: z.infer<typeof Wan21T2v480pLoraSchema>;

  constructor(
    prompt: string,
    duration?: number,
    enable_safety_checker?: boolean,
    flow_shift?: number,
    guidance_scale?: number,
    loras?: z.infer<typeof LoraWeightSchema>[],
    negative_prompt?: string,
    num_inference_steps?: number,
    seed?: number,
    size?: "832*480" | "480*832"
  ) {
    super();
    this.data = {
      prompt,
      ...(duration !== undefined && { duration }),
      ...(enable_safety_checker !== undefined && { enable_safety_checker }),
      ...(flow_shift !== undefined && { flow_shift }),
      ...(guidance_scale !== undefined && { guidance_scale }),
      ...(loras !== undefined && { loras }),
      ...(negative_prompt !== undefined && { negative_prompt }),
      ...(num_inference_steps !== undefined && { num_inference_steps }),
      ...(seed !== undefined && { seed }),
      ...(size !== undefined && { size }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/t2v-480p-lora";
  }

  getModelType(): string {
    return "text-to-video";
  }
}