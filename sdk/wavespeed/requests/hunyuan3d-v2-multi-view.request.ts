import { z } from 'zod';
import { BaseRequest } from '../base';

const Hunyuan3dV2MultiViewSchema = z.object({
  back_image_url: z.string().describe('URL of image to use while generating the 3D model.'),
  front_image_url: z.string().describe('URL of image to use while generating the 3D model.'),
  guidance_scale: z.number().describe('Guidance scale for the model.').min(0.0).max(20.0).default(7.5),
  left_image_url: z.string().describe('URL of image to use while generating the 3D model.'),
  num_inference_steps: z.number().int().describe('Number of inference steps to perform.').min(1).max(50).default(50),
  octree_resolution: z.number().int().describe('Octree resolution for the model.').min(1).max(1024).default(256),
  seed: z.number().int().describe('The same seed and the same prompt given to the same version of the model will output the same image every time.').min(-1).max(9999999999).optional(),
  textured_mesh: z.boolean().describe('If set true, textured mesh will be generated and the price charged would be 3 times that of white mesh.').default(false),
});

export class Hunyuan3dV2MultiViewRequest extends BaseRequest<typeof Hunyuan3dV2MultiViewSchema> {
  protected schema = Hunyuan3dV2MultiViewSchema;
  protected data: z.infer<typeof Hunyuan3dV2MultiViewSchema>;

  constructor(
    front_image_url: string,
    back_image_url: string,
    left_image_url: string,
    params?: {
      seed?: number;
      num_inference_steps?: number;
      guidance_scale?: number;
      octree_resolution?: number;
      textured_mesh?: boolean;
    }
  ) {
    super();
    this.data = {
      front_image_url,
      back_image_url,
      left_image_url,
      seed: params?.seed,
      num_inference_steps: params?.num_inference_steps ?? Hunyuan3dV2MultiViewSchema.shape.num_inference_steps._def.defaultValue(),
      guidance_scale: params?.guidance_scale ?? Hunyuan3dV2MultiViewSchema.shape.guidance_scale._def.defaultValue(),
      octree_resolution: params?.octree_resolution ?? Hunyuan3dV2MultiViewSchema.shape.octree_resolution._def.defaultValue(),
      textured_mesh: params?.textured_mesh ?? Hunyuan3dV2MultiViewSchema.shape.textured_mesh._def.defaultValue(),
    };
    
  }

  getModelUuid(): string {
    return "wavespeed-ai/hunyuan3d-v2-multi-view";
  }

  getModelType(): string {
    return "image-to-3d";
  }
}