import { z } from 'zod';
import { BaseRequest } from '../base';

const HunyuanVideoI2vSchema = z.object({
  prompt: z.string().describe('The prompt to generate the video from.').optional(),
  image: z.string().describe('The image to generate the video from.'),
  num_inference_steps: z.number().int().min(2).max(30).describe('The number of inference steps to run. Lower gets faster results, higher gets better results.').optional(),
  duration: z.number().int().min(5).max(10).describe('Generate video duration length seconds.').optional(),
  seed: z.number().int().min(-1).max(9999999999).describe('The seed to use for generating the video.').optional(),
  size: z.enum(["1280*720", "720*1280"]).describe('The size of the output.').optional(),
  enable_safety_checker: z.boolean().describe('If set to true, the safety checker will be enabled.').optional(),
});

export class HunyuanVideoI2vRequest extends BaseRequest<typeof HunyuanVideoI2vSchema> {
  protected schema = HunyuanVideoI2vSchema;
  
  static create(
    image: string,
    prompt?: string,
    num_inference_steps?: number,
    duration?: number,
    seed?: number,
    size?: "1280*720" | "720*1280",
    enable_safety_checker?: boolean
  ) {
    const request = new HunyuanVideoI2vRequest();
    request.data = {
      image,
      prompt: prompt ?? "A pale vampire woman slowly walks to a candlelit window, her crimson eyes glowing in the dark. She lifts one hand and gently taps her long, sharp nails against the glass. Her expression shifts from seductive to dangerous. Outside, bats flutter past a glowing full moon, casting flickering shadows across her face. The candlelight flickers, reflecting in her eyes as she stares into the night",
      num_inference_steps: num_inference_steps ?? 30,
      duration: duration ?? 5,
      seed: seed ?? -1,
      size: size ?? "1280*720",
      enable_safety_checker: enable_safety_checker ?? true,
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/hunyuan-video/i2v";
  }

  getModelType(): string {
    return "image-to-video";
  }

  getDefaultParams(): Record<string,any> {
    return {
      num_inference_steps: 30,
      duration: 5,
    }
  }

  getFeatureCalculator(): string {
    return "duration/5";
  }
}