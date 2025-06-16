import { z } from "zod";
import { BaseRequest } from "../base";

const DiaTTSSchema = z.object({
  prompt: z
    .string()
    .min(1, {
      message: "Prompt text is required for text-to-speech generation",
    })
    .describe("The text to be converted to speech."),
});

export class DiaTTSRequest extends BaseRequest<typeof DiaTTSSchema> {
  protected schema = DiaTTSSchema;

  static create(prompt: string) {
    const request = new DiaTTSRequest();
    request.data = { prompt };
    return request;
  }

  getModelUuid(): string {
    return "wavespeed-ai/dia-tts";
  }

  getModelType(): string {
    return "text-to-audio";
  }

  getDefaultParams(): Record<string, any> {
    return {};
  }

  getFeatureCalculator(): string {
    return "1";
  }
}
