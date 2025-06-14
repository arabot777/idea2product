import { z } from 'zod';
import { BaseRequest } from '../base';

const MinimaxVideo01Schema = z.object({
  prompt: z.string().max(2000).describe('Generate a description of the video.(Note: Maximum support 2000 characters). 1. Support inserting mirror operation instructions to realize mirror operation control: mirror operation instructions need to be inserted into the lens application position in prompt in the format of [ ]. The standard mirror operation instruction format is [C1,C2,C3], where C represents different types of mirror operation. In order to ensure the effect of mirror operation, it is recommended to combine no more than 3 mirror operation instructions. 2. Support natural language description to realize mirror operation control; using the command internal mirror name will improve the accuracy of mirror operation response. 3. mirror operation instructions and natural language descriptions can be effective at the same time.'),
  image: z.string().optional().describe('The model generates video with the picture passed in as the first frame.Base64 encoded strings in data:image/jpeg; base64,{data} format for incoming images, or URLs accessible via the public network. The uploaded image needs to meet the following conditions: Format is JPG/JPEG/PNG; The aspect ratio is greater than 2:5 and less than 5:2; Short side pixels greater than 300px; The image file size cannot exceed 20MB.'),
  enable_prompt_expansion: z.boolean().optional().default(true).describe('The model automatically optimizes incoming prompts to improve build quality.'),
});

export class MinimaxVideo01Request extends BaseRequest<typeof MinimaxVideo01Schema> {
  protected schema = MinimaxVideo01Schema;
  protected data: z.infer<typeof MinimaxVideo01Schema>;

  constructor(prompt: string, image?: string, enable_prompt_expansion: boolean = true) {
    super();
    this.data = { prompt, enable_prompt_expansion };
    if (image !== undefined) {
      this.data.image = image;
    }
    
  }

  getModelUuid(): string {
    return "minimax/video-01";
  }

  getModelType(): string {
    return "image-to-video";
  }

  static getDefaultParams(): Record<string,any> {
    return {

    }
  }

  static getFeatureCalculator(): string {
    return "1";
  }
}