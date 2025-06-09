import { z } from 'zod';
import { BaseRequest } from '../base';

const HunyuanVideoT2vSchema = z.object({
  prompt: z.string().min(1, {
    message: 'Prompt text is required for text-to-video generation',
  }).describe('The prompt to generate the video from.'),
  enable_safety_checker: z.boolean().default(true).optional().describe('If set to true, the safety checker will be enabled.'),
  num_inference_steps: z.number().int().min(2).max(30).default(30).optional().describe('The number of inference steps to run. Lower gets faster results, higher gets better results.'),
  seed: z.number().int().default(-1).optional().describe('The seed to use for generating the video.'),
  size: z.enum(["1280*720", "720*1280"]).default("1280*720").optional().describe('The size of the output.')
});

export class HunyuanVideoT2vRequest extends BaseRequest<typeof HunyuanVideoT2vSchema> {
  protected schema = HunyuanVideoT2vSchema;
  protected data: z.infer<typeof HunyuanVideoT2vSchema>;

  constructor(
    prompt: string,
    enable_safety_checker?: boolean,
    num_inference_steps?: number,
    seed?: number,
    size?: "1280*720" | "720*1280"
  ) {
    super();
    this.data = {
      prompt,
      ...(enable_safety_checker !== undefined && { enable_safety_checker }),
      ...(num_inference_steps !== undefined && { num_inference_steps }),
      ...(seed !== undefined && { seed }),
      ...(size !== undefined && { size }),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/hunyuan-video/t2v";
  }

  getModelType(): string {
    return "text-to-video";
  }
}