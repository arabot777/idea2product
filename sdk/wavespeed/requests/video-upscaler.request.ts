import { z } from 'zod';
import { BaseRequest } from '../base';

const VideoUpscalerSchema = z.object({
  video: z.string().describe('The video to upscale'),
  target_resolution: z.enum(["720p", "1080p", "2k", "4k"]).optional().describe('Target resolution to upscale to.'),
  copy_audio: z.boolean().optional().describe('Whether to copy the original video\'s audio to the upscaled video')
});

export class VideoUpscalerRequest extends BaseRequest<typeof VideoUpscalerSchema> {
  protected schema = VideoUpscalerSchema;
  
  static create(video: string, target_resolution?: "720p" | "1080p" | "2k" | "4k", copy_audio?: boolean) {
    const request = new VideoUpscalerRequest();
    request.data = { video };
    if (target_resolution !== undefined) {
      request.data.target_resolution = target_resolution;
    }
    if (copy_audio !== undefined) {
      request.data.copy_audio = copy_audio;
    }
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/video-upscaler";
  }

  getModelType(): string {
    return "video-to-video";
  }

  getDefaultParams(): Record<string,any> {
    return {
      video: "",
      target_resolution: undefined,
      copy_audio: undefined,
    }
  }

  getFeatureCalculator(): string {
    return "1";
  }
}