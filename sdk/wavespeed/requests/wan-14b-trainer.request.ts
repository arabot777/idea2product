import { z } from 'zod';
import { BaseRequest } from '../base';

const Wan14bTrainerSchema = z.object({
  data: z.string().min(1, {
    message: 'Images Data Url is required.',
  }).describe('To train a WAN Lora, you need at least 10 face images to achieve good results.you can check out our default image dataset. '),
  trigger_word: z.string().optional().default('p3r5on').describe('The phrase that will trigger the model to generate an video.'),
  steps: z.number().int().min(1000).max(4000).optional().default(2000).describe('Number of steps to train the LoRA on.'),
});

export class Wan14bTrainerRequest extends BaseRequest<typeof Wan14bTrainerSchema> {
  protected schema = Wan14bTrainerSchema;
  
  static create(
    data: string,
    trigger_word?: string,
    steps?: number
  ) {
    const request = new Wan14bTrainerRequest();
    request.data = {
      data,
      trigger_word: trigger_word === undefined ? 'p3r5on' : trigger_word,
      steps: steps === undefined ? 2000 : steps,
    };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-14b-trainer";
  }

  getModelType(): string {
    return "training";
  }
  getDefaultParams(): Record<string,any> {
    return {
      steps: 2000,
    }
  }

  getFeatureCalculator(): string {
    return "steps";
  }
}