"use server";

import { toolCall } from "@/app/actions/tool/tool-call";
import { toolStatus } from "@/app/actions/tool/tool-status";
import { TaskStatus, TaskStatusType } from "@/lib/types/task/enum.bean";
import { TaskInfo } from "@/lib/types/task/task.bean";
import { CODE } from "@/lib/unibee/metric-code";

// ID照片生成参数接口
export interface IdPhotoGeneratorParams {
  image: string; // 原始图片URL或base64
  photoSpec: {
    id: string;
    width: number;
    height: number;
    name: string;
    description: string;
    usage: string;
    mmWidth: number;
    mmHeight: number;
  };
  backgroundColor: string; // 背景颜色
  enhanceQuality?: boolean; // 是否增强质量
}

// 任务信息接口 - 直接使用TaskInfo
export interface IdPhotoTaskInfo extends TaskInfo {}

// 证件照专用prompt生成器
const generateIdPhotoPrompt = (params: IdPhotoGeneratorParams): string => {
  const { photoSpec, backgroundColor, enhanceQuality } = params;
  
  // 基础证件照prompt - 强调保持面部特征不变
  let basePrompt = `Create a professional ID photo from this person's face. 
IMPORTANT: 
- Only change the background and photo composition.
- Keep all facial features, face shape, skin tone, and facial characteristics exactly the same as the original person.
- Remove the ENTIRE background and make it 100% transparent (RGBA with alpha channel)
- Ensure clean, sharp edges around the subject with no background artifacts
- Maintain natural hair details and fine edges
- Output format must support transparency (PNG recommended)

The photo should have:
- PRESERVE all original facial features, expressions, and characteristics
- Professional portrait style with clean composition
- Formal appearance suitable for official documents
- Sharp focus and professional lighting
- Centered composition with straight posture
- Neutral facial expression looking directly at camera
- High quality and detailed rendering
- DO NOT alter face shape, skin color, facial features, or any personal characteristics`;
  
  // 根据背景颜色调整prompt
  const colorMap: { [key: string]: string } = {
    '#FFFFFF': 'pure white background',
    '#2072B8': 'solid blue background', 
    '#E30E19': 'solid red background',
    '#CCCCCC': 'light gray background',
    '#009944': 'solid green background',
    '#FFC0CB': 'light pink background',
    'transparent': 'rgba(0,0,0,0)'
  };
  
  const backgroundDesc = colorMap[backgroundColor] || 'pure white background';
  basePrompt += `\n- Replace ONLY the background with ${backgroundDesc}`;
  
  // 根据照片规格调整prompt
  if (photoSpec.usage.toLowerCase().includes('passport')) {
    basePrompt += '\n- Meet passport photo requirements and standards while maintaining original facial features';
  } else if (photoSpec.usage.toLowerCase().includes('id card')) {
    basePrompt += '\n- Meet ID card photo requirements and standards while maintaining original facial features';
  } else if (photoSpec.usage.toLowerCase().includes('visa')) {
    basePrompt += '\n- Meet visa photo requirements and standards while maintaining original facial features';
  }
  
  // 质量增强
  if (enhanceQuality) {
    basePrompt += '\n- Ultra high quality with professional photography standards, preserving original identity';
  }
  
  // 添加技术参数 - 强调身份保持
  basePrompt += '\n- Photorealistic, detailed, crisp, no blur, professional headshot quality';
  basePrompt += '\n- CRITICAL: Maintain the exact same person identity, do not change any facial characteristics';
  
  return basePrompt;
};

// 证件照参数预处理 - 将业务参数转换为FluxDev参数
const preprocessIdPhotoParams = (params: IdPhotoGeneratorParams) => {
  // 生成优化的prompt
  const optimizedPrompt = generateIdPhotoPrompt(params);
  
  // 证件照专用参数配置
  return {
    prompt: optimizedPrompt,
    image: params.image, // 原始图片
    seed: -1,
    guidance_scale: 4.0, // 适中的引导比例
    safety_tolerance: "2", // 安全级别设置为中等
    width: params.photoSpec.width,
    height: params.photoSpec.height,
    num_inference_steps: 28, // 推理步数
    strength: 0.8, // 图生图强度
  };
};

/**
 * ID照片生成服务 - 使用新的toolCall架构
 * @param params ID照片生成参数
 */
export const generateIdPhoto = async (
  params: IdPhotoGeneratorParams
): Promise<IdPhotoTaskInfo> => {
  try {
    // 1. 前处理：将业务参数转换为FluxDev参数
    const requestData = preprocessIdPhotoParams(params);
    
    // 2. 调用toolCall启动任务
    const taskInfo = await toolCall({
      code: CODE.FluxKontextPro,
      requestData: requestData,
    });
    
    // 3. 返回任务信息
    if (taskInfo.id) {
      return taskInfo;
    } else {
      return {
        id: "",
        status: TaskStatus.FAILED,
        message: taskInfo.message || "Failed to submit ID photo generation request",
      };
    }
    
  } catch (error) {
    console.error("generateIdPhoto failed:", error);
    return {
      id: "",
      status: TaskStatus.FAILED,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * 查询ID照片生成任务状态 - 使用新的toolStatus架构
 * @param taskId 任务ID
 */
export const getIdPhotoTaskStatus = async (
  taskId: string
): Promise<IdPhotoTaskInfo> => {
  try {
    // 直接调用toolStatus查询任务状态
    const taskInfo = await toolStatus(taskId);
    
    // 可以在这里添加证件照特有的状态处理逻辑
    // 比如：进度描述本地化、结果验证等
    console.log("getIdPhotoTaskStatus", taskInfo);
    
    return taskInfo;
    
  } catch (error) {
    console.error("check picture status failed:", error);
    return {
      id: taskId,
      status: TaskStatus.FAILED,
      message: error instanceof Error ? error.message : "check picture status failed",
    };
  }
};



 