import { z } from "zod";
import { BaseRequest } from "../base";

const Wan21T2v480pUltraFastSchema = z.object({
  prompt: z.string().describe("The prompt for generating the output."),
  negative_prompt: z.string().optional().default("").describe("The negative prompt for generating the output."),
  size: z.enum(["832*480", "480*832"]).optional().default("832*480").describe("The size of the output."),
  num_inference_steps: z.number().int().min(0).max(40).optional().default(30).describe("The number of inference steps."),
  duration: z.number().int().min(5).max(10).optional().default(5).describe("Generate video duration length seconds."),
  guidance_scale: z.number().min(1.01).max(10).optional().default(5).describe("The guidance scale for generation."),
  flow_shift: z.number().min(1).max(10).optional().default(3).describe("The shift value for the timestep schedule for flow matching."),
  seed: z.number().int().optional().default(-1).describe("The seed for random number generation."),
  enable_safety_checker: z.boolean().optional().default(true).describe("Whether to enable the safety checker."),
});

export class Wan21T2v480pUltraFastRequest extends BaseRequest<typeof Wan21T2v480pUltraFastSchema> {
  protected schema = Wan21T2v480pUltraFastSchema;

  static create(
    prompt: string,
    negative_prompt?: string,
    size?: "832*480" | "480*832",
    num_inference_steps?: number,
    duration?: number,
    guidance_scale?: number,
    flow_shift?: number,
    seed?: number,
    enable_safety_checker?: boolean
  ) {
    const request = new Wan21T2v480pUltraFastRequest();
    request.data = {
      prompt,
      negative_prompt: negative_prompt ?? "",
      size: size ?? "832*480",
      num_inference_steps: num_inference_steps ?? 30,
      duration: duration ?? 5,
      guidance_scale: guidance_scale ?? 5,
      flow_shift: flow_shift ?? 3,
      seed: seed ?? -1,
      enable_safety_checker: enable_safety_checker ?? true,
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-2.1/t2v-480p-ultra-fast";
  }

  getModelType(): string {
    return "text-to-video";
  }
  getDefaultParams(): Record<string, any> {
    return {
      num_inference_steps: 30,
      duration: 5,
    };
  }

  getFeatureCalculator(): string {
    return "duration/5";
  }
}
