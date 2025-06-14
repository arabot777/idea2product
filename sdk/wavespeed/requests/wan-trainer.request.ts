import { z } from "zod";
import { BaseRequest } from "../base";

const WanTrainerSchema = z.object({
  auto_scale_input: z.boolean().default(true).describe("If true, the input will be automatically scale the video to 81 frames at 16fps.").optional(),
  learning_rate: z
    .number()
    .min(1e-6)
    .max(1)
    .default(0.0002)
    .describe("The rate at which the model learns. Higher values can lead to faster training, but over-fitting.")
    .optional(),
  number_of_steps: z.number().int().min(1).max(20000).default(400).describe("The number of steps to train for.").optional(),
  training_data_url: z.string().describe("URL to zip archive with images of a consistent style. Try to use at least 10 images, although more is better."),
  trigger_phrase: z.string().default("").describe("The phrase that will trigger the model to generate an image.").optional(),
});

export class WanTrainerRequest extends BaseRequest<typeof WanTrainerSchema> {
  protected schema = WanTrainerSchema;
  protected data: z.infer<typeof WanTrainerSchema>;

  constructor(trainingDataUrl: string, numberOfSteps?: number, learningRate?: number, triggerPhrase?: string, autoScaleInput?: boolean) {
    super();
    this.data = {
      training_data_url: trainingDataUrl,
      ...(numberOfSteps !== undefined && { number_of_steps: numberOfSteps }),
      ...(learningRate !== undefined && { learning_rate: learningRate }),
      ...(triggerPhrase !== undefined && { trigger_phrase: triggerPhrase }),
      ...(autoScaleInput !== undefined && { auto_scale_input: autoScaleInput }),
    };
  }

  getModelUuid(): string {
    return "wavespeed-ai/wan-trainer";
  }

  getModelType(): string {
    return "training";
  }
  static getDefaultParams(): Record<string, any> {
    return {
      number_of_steps: 400,
    };
  }

  static getFeatureCalculator(): string {
    return "number_of_steps";
  }
}
