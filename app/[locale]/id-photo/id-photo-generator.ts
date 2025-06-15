"use server";

import { wsKcontext, wsKcontextStatus, WSKcontextParams, TaskInfo } from "@/app/actions/tool/ws-kcontext";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { TaskStatus } from "@/lib/types/task/enum.bean";
import { ID_PHOTO_SPECS, ID_PHOTO_BACKGROUNDS } from "./constants";

// ID照片生成参数接口
export interface IdPhotoGeneratorParams {
  image: string; // 原始图片URL
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

// 任务信息接口 - 直接复用原有的TaskInfo
export interface IdPhotoTaskInfo extends TaskInfo {}

// 证件照专用prompt生成器 - 针对Kcontext模型优化
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

// 证件照参数预处理 - 将业务参数转换为Kcontext参数
const preprocessIdPhotoParams = (params: IdPhotoGeneratorParams): WSKcontextParams => {
  // 生成优化的prompt
  const optimizedPrompt = generateIdPhotoPrompt(params);
  
  // 证件照专用参数配置
  return {
    prompt: optimizedPrompt,
    image: params.image, // 原始图片
    seed: -1,
    guidance_scale: 4.0, // 适中的引导比例
    safety_tolerance: "2", // 安全级别设置为中等
  };
};

// 证件照结果后处理 - 添加业务相关的元数据和验证
const postprocessIdPhotoResult = (taskInfo: TaskInfo, originalParams: IdPhotoGeneratorParams): IdPhotoTaskInfo => {
  // 这里可以添加证件照特有的后处理逻辑
  // 比如：尺寸验证、质量检查、格式转换等
  
  // 目前直接返回，保持与原TaskInfo的兼容性
  return {
    ...taskInfo,
    // 可以在这里添加证件照特有的字段
    // photoSpec: originalParams.photoSpec,
    // backgroundColor: originalParams.backgroundColor,
  };
};

/**
 * ID照片生成服务 - 业务层封装
 * @param params ID照片生成参数
 */
export const generateIdPhoto = async (
  params: IdPhotoGeneratorParams
): Promise<IdPhotoTaskInfo> => {
  try {
    // 1. 前处理：将业务参数转换为Kcontext参数
    const kcontextParams = preprocessIdPhotoParams(params);
    
    // 2. 调用底层工具 (userContext会被dataActionWithPermission自动注入)
    const taskInfo = await wsKcontext(kcontextParams);
    
    // 3. 后处理：添加业务相关的元数据
    return postprocessIdPhotoResult(taskInfo, params);
    
  } catch (error) {
    console.error("生成证件照失败:", error);
    return {
      id: "",
      status: TaskStatus.FAILED,
      message: error instanceof Error ? error.message : "未知错误",
    };
  }
};

/**
 * 查询ID照片生成任务状态 - 业务层封装
 * @param taskId 任务ID
 */
export const getIdPhotoTaskStatus = async (
  taskId: string
): Promise<IdPhotoTaskInfo> => {
  try {
    // 直接调用底层工具 (userContext会被dataActionWithPermission自动注入)
    const taskInfo = await wsKcontextStatus(taskId);
    
    // 可以在这里添加证件照特有的状态处理逻辑
    // 比如：进度描述本地化、结果验证等
    console.log("getIdPhotoTaskStatus", taskInfo);
    
    return taskInfo;
    
  } catch (error) {
    console.error("查询证件照任务状态失败:", error);
    return {
      id: taskId,
      status: TaskStatus.FAILED,
      message: error instanceof Error ? error.message : "查询失败",
    };
  }
};



 