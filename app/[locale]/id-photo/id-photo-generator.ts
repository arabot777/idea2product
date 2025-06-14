"use server";

import { wsFluxDevUltraFast, wsFluxDevUltraFastStatus, FluxDevUltraFastParams, TaskInfo } from "@/app/actions/tool/ws-flux-dev-ultra-fast";
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

// 证件照专用prompt生成器
const generateIdPhotoPrompt = (params: IdPhotoGeneratorParams): string => {
  const { photoSpec, backgroundColor, enhanceQuality } = params;
  
  // 基础证件照prompt
  let basePrompt = `Professional ID photo, passport photo style, formal portrait, clean background, high quality, sharp focus, professional lighting, centered composition, straight posture, neutral expression, looking directly at camera`;
  
  // 根据背景颜色调整prompt
  const colorMap: { [key: string]: string } = {
    '#FFFFFF': 'white background',
    '#2072B8': 'blue background', 
    '#E30E19': 'red background',
    '#CCCCCC': 'gray background',
    '#009944': 'green background',
    '#FFC0CB': 'pink background'
  };
  
  const backgroundDesc = colorMap[backgroundColor] || 'white background';
  basePrompt += `, ${backgroundDesc}`;
  
  // 根据照片规格调整prompt
  if (photoSpec.usage.toLowerCase().includes('passport')) {
    basePrompt += ', passport photo requirements, official document photo';
  } else if (photoSpec.usage.toLowerCase().includes('id card')) {
    basePrompt += ', ID card photo requirements, government document photo';
  } else if (photoSpec.usage.toLowerCase().includes('visa')) {
    basePrompt += ', visa photo requirements, immigration document photo';
  }
  
  // 质量增强
  if (enhanceQuality) {
    basePrompt += ', ultra high quality, professional photography, studio lighting, 4K resolution';
  }
  
  // 添加技术参数
  basePrompt += ', photorealistic, detailed, crisp, no blur, professional headshot';
  
  return basePrompt;
};

// 证件照参数预处理 - 将业务参数转换为FluxDev参数
const preprocessIdPhotoParams = (params: IdPhotoGeneratorParams): FluxDevUltraFastParams => {
  // 生成优化的prompt
  const optimizedPrompt = generateIdPhotoPrompt(params);
  
  // 证件照专用参数配置
  return {
    prompt: optimizedPrompt,
    image: params.image, // 原始图片
    strength: 0.7, // 图像到图像的强度，保持人物特征
    size: `${params.photoSpec.width}*${params.photoSpec.height}`, // 根据证件照规格设置尺寸
    num_inference_steps: 35, // 增加步数以获得更好的质量
    seed: -1,
    guidance_scale: 4.0, // 适中的引导比例
    num_images: 1, // 证件照通常只需要一张
    enable_base64_output: false,
    enable_safety_checker: true,
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
    // 1. 前处理：将业务参数转换为FluxDev参数
    const fluxParams = preprocessIdPhotoParams(params);
    
    // 2. 调用底层工具 (userContext会被dataActionWithPermission自动注入)
    const taskInfo = await wsFluxDevUltraFast(fluxParams);
    
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
    const taskInfo = await wsFluxDevUltraFastStatus(taskId);
    
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

 