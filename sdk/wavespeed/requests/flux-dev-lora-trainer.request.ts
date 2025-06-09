import { z } from 'zod';
import { BaseRequest } from '../base';

const FluxDevLoraTrainerSchema = z.object({
  data: z.string().min(1, {
    message: 'Data URL is required.',
  }).describe('URL to zip archive with images. Try to use at least 4 images in general the more the better. In addition to images the archive can contain text files with captions. Each text file should have the same name as the image file it corresponds to.'),
  steps: z.number().int().min(1000).max(4000).default(1000).optional().describe('Number of steps to train the LoRA on.'),
  trigger_word: z.string().nullable().default('p3r5on').describe('Trigger word to be used in the captions. If None, a trigger word will not be used. If no captions are provide the trigger_word will be used instead of captions. If captions are the trigger word will not be used.')
});

export class FluxDevLoraTrainerRequest extends BaseRequest<typeof FluxDevLoraTrainerSchema> {
  protected schema = FluxDevLoraTrainerSchema;
  protected data: z.infer<typeof FluxDevLoraTrainerSchema>;

  constructor(data: string, trigger_word: string | null = 'p3r5on', steps: number = 1000) {
    super();
    this.data = { data, trigger_word, steps };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/flux-dev-lora-trainer";
  }

  getModelType(): string {
    return "training";
  }
}