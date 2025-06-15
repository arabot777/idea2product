'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
// @ts-ignore
import { removeBackground } from '@imgly/background-removal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Upload, 
  Download, 
  Wand2, 
  Loader2, 
  ImageIcon, 
  Crop,
  RotateCcw,
  ArrowLeft,
  Settings,
  Palette,
  Check
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import Navbar from '@/components/navbar';
import { generateIdPhoto, getIdPhotoTaskStatus } from './id-photo-generator';
import { 
  ID_PHOTO_SPECS, 
  ID_PHOTO_CATEGORIES, 
  AI_BACKGROUNDS, 
  FRONTEND_BACKGROUNDS, 
  LAYOUT_SIZES,
  getLocalizedText 
} from './constants';
import { TaskStatus } from '@/lib/types/task/enum.bean';
// 水印组件
const Watermark = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations('HomePage.idPhoto');
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/10 pointer-events-none">
        <div className="absolute bottom-2 right-2 text-xs text-white/60 font-mono bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
          {t('watermark')}
        </div>
      </div>
    </div>
  );
};

// 简化的尺寸说明组件
const DimensionInfo = ({ 
  spec,
  show = true,
  t
}: { 
  spec: typeof ID_PHOTO_SPECS[0];
  show?: boolean;
  t: any;
}) => {
  if (!show) return null;
  
  return (
    <div className="mt-4 text-center">
      <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-blue-700 font-medium">
          下载尺寸：{getLocalizedText(t, spec, spec.name)} ({spec.width} × {spec.height} 像素)
        </span>
      </div>
    </div>
  );
};

// 获取base64字符串的大小（字节）
const getBase64Size = (base64String: string): number => {
  const base64Data = base64String.split(',')[1] || base64String;
  const padding = (base64Data.match(/=/g) || []).length;
  return Math.floor((base64Data.length * 3) / 4) - padding;
};

// 裁剪图片的工具函数
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = document.createElement('img') as HTMLImageElement;
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error: any) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return canvas.toDataURL('image/jpeg', 0.8);
};

// 轮询回调接口
interface IdPhotoPollingCallbacks {
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onStatusUpdate?: (status: string) => void;
}

// 客户端轮询函数
const startIdPhotoPolling = (
  taskId: string,
  callbacks: IdPhotoPollingCallbacks
): (() => void) => {
  let isPolling = true;
  let pollCount = 0;
  const maxPollCount = 120; // 最多轮询2分钟 (120 * 1000ms)
  
  const poll = async () => {
    if (!isPolling || pollCount >= maxPollCount) {
      if (pollCount >= maxPollCount) {
        callbacks.onError?.('任务超时');
      }
      return;
    }
    
    try {
      const taskInfo = await getIdPhotoTaskStatus(taskId);
      pollCount++;
      
      // 更新状态
      callbacks.onStatusUpdate?.(taskInfo.status);
      
      // 计算进度
      let progress = 0;
      if (taskInfo.status === TaskStatus.PENDING) {
        progress = Math.min(10, pollCount * 2);
      } else if (taskInfo.status === TaskStatus.PROCESSING) {
        progress = Math.min(90, 20 + pollCount * 3);
      } else if (taskInfo.status === TaskStatus.COMPLETED) {
        progress = 100;
      }
      
      callbacks.onProgress?.(progress);
      
      if (taskInfo.status === TaskStatus.COMPLETED) {
        isPolling = false;
        callbacks.onSuccess?.(taskInfo);
        return;
      }
      
      if (taskInfo.status === TaskStatus.FAILED || taskInfo.status === TaskStatus.CANCELLED) {
        isPolling = false;
        callbacks.onError?.(taskInfo.message || '任务失败');
        return;
      }
      
      // 继续轮询
      setTimeout(poll, 1000);
      
    } catch (error) {
      console.error('轮询错误:', error);
      callbacks.onError?.(error instanceof Error ? error.message : '轮询失败');
      isPolling = false;
    }
  };
  
  // 开始轮询
  poll();
  
  // 返回停止函数
  return () => {
    isPolling = false;
  };
};

export default function IdPhotoPage() {
  const router = useRouter();
  const t = useTranslations('HomePage.idPhoto');
  
  // 基础状态
  const [selectedSpec, setSelectedSpec] = useState(ID_PHOTO_SPECS[0]);
  const [selectedBackground, setSelectedBackground] = useState(AI_BACKGROUNDS[0]);
  const [selectedCategory, setSelectedCategory] = useState('common');
  const [selectedLayoutSize, setSelectedLayoutSize] = useState(LAYOUT_SIZES[0]);
  
  // 功能选择状态
  const [activeTab, setActiveTab] = useState('idPhotoMaker'); // idPhotoMaker, backgroundReplace, sizeAdjust, layoutArrange
  const [showBackgroundReplace, setShowBackgroundReplace] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  
  // 全局状态管理
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState<string | null>(null); // 当前选择的背景色
  const [isInLayoutMode, setIsInLayoutMode] = useState(false); // 是否为排版模式
  
  // 图片上传和处理状态
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalProcessedImage, setOriginalProcessedImage] = useState<string | null>(null); // 保存原始处理结果
  const [removedBackgroundImage, setRemovedBackgroundImage] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStartedProcessing, setHasStartedProcessing] = useState(false); // 新增：跟踪是否已开始处理
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // 裁剪相关状态
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  
  // 其他状态
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [croppedForSpec, setCroppedForSpec] = useState<string | null>(null); // 按规格裁剪的图片
  const stopPollingRef = useRef<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 清理轮询
  useEffect(() => {
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
    };
  }, []);

  // 压缩图片到指定大小
  const compressImageToSize = useCallback(async (canvas: HTMLCanvasElement, targetSizeKB: number): Promise<string> => {
    let quality = 0.8;
    let result = canvas.toDataURL('image/jpeg', quality);
    
    while (getBase64Size(result) > targetSizeKB * 1024 && quality > 0.1) {
      quality -= 0.1;
      result = canvas.toDataURL('image/jpeg', quality);
    }
    
    return result;
  }, []);

  // 获取图片尺寸
  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = src;
    });
  };

  // 裁剪完成回调
  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // 应用裁剪
  const handleCropApply = useCallback(async () => {
    if (!uploadedImage || !croppedAreaPixels) return;

    try {
      const croppedImg = await getCroppedImg(uploadedImage, croppedAreaPixels, rotation);
      setCroppedImage(croppedImg);
      setShowCropper(false);
      toast.success(t('cropSuccess'));
    } catch (error) {
      console.error('裁剪失败:', error);
      toast.error(t('cropFailed'));
    }
  }, [uploadedImage, croppedAreaPixels, rotation, t]);

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件大小 (5MB限制)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t('fileSizeExceeded'));
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageSrc = e.target?.result as string;
      setUploadedImage(imageSrc);
      setProcessedImage(null);
      setCroppedImage(null);
      setIsUploaded(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      
      // 获取原始图片尺寸
      const dimensions = await getImageDimensions(imageSrc);
      setOriginalImageSize(dimensions);
    };
    reader.readAsDataURL(file);

    // 模拟上传进度
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    toast.success(t('uploadSuccess'));
  };

  // 前端移除背景
  const handleRemoveBackground = async (imageUrl: string): Promise<string> => {
    try {
      setIsRemovingBackground(true);
      
      // 检查图片URL是否有跨域问题
      let imageData;
      
      if (imageUrl.startsWith('data:')) {
        // 如果是base64数据，直接使用
        const response = await fetch(imageUrl);
        imageData = await response.blob();
      } else {
        // 如果是外部URL，需要通过代理或转换
        try {
          const response = await fetch(imageUrl, {
            mode: 'cors',
            headers: {
              'Access-Control-Allow-Origin': '*',
            }
          });
          imageData = await response.blob();
        } catch (corsError) {
          // 如果跨域失败，尝试通过canvas转换
          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
          });
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          imageData = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/jpeg', 0.95);
          });
        }
      }
      
      // 使用blob进行背景移除
      const imageBlob = await removeBackground(imageData);
      
      // 转换为base64 URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(imageBlob);
      });
    } catch (error) {
      console.error('背景移除失败:', error);
      throw error;
    } finally {
      setIsRemovingBackground(false);
    }
  };

  // 前端替换背景色（用于透明背景图片）
  const applyBackgroundColor = (imageUrl: string, backgroundColor: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 填充背景色
        if (ctx) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // 绘制图片（如果是透明背景会叠加在新背景上）
          ctx.drawImage(img, 0, 0);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });
  };

  // 统一的图片更新函数 - 处理规格、排版、背景色的联动
  const updateImageWithCurrentSettings = async (
    sourceImage?: string, 
    newSpec?: typeof ID_PHOTO_SPECS[0],
    newLayoutSize?: typeof LAYOUT_SIZES[0] | null,
    newBackgroundColor?: string
  ) => {
    try {
      // 确定当前设置
      const currentSpec = newSpec || selectedSpec;
      const currentLayout = newLayoutSize !== undefined ? newLayoutSize : (isInLayoutMode ? selectedLayoutSize : null);
      const currentBgColor = newBackgroundColor || currentBackgroundColor;
      const baseImage = sourceImage || originalProcessedImage;
      
      if (!baseImage) return;
      
      // 步骤1: 获取基础图片（原图或抠图结果）
      let workingImage = baseImage;
      if (currentBgColor && removedBackgroundImage) {
        // 如果有选择背景色且有抠图结果，使用抠图结果
        workingImage = removedBackgroundImage;
      }
      
      // 步骤2: 按规格裁剪
      const croppedImg = await cropToSelectedSpec(workingImage, currentSpec);
      setCroppedForSpec(croppedImg);
      
      // 步骤3: 应用背景色（如果有）
      let finalImage = croppedImg;
      if (currentBgColor && removedBackgroundImage) {
        finalImage = await applyBackgroundColor(croppedImg, currentBgColor);
      }
      
      // 步骤4: 应用排版（如果需要）
      if (currentLayout) {
        finalImage = await createPhotoLayout(finalImage, currentLayout, currentSpec);
        setIsInLayoutMode(true);
        setSelectedLayoutSize(currentLayout);
      } else {
        setIsInLayoutMode(false);
      }
      
      // 步骤5: 更新状态
      setProcessedImage(finalImage);
      if (newSpec) setSelectedSpec(newSpec);
      if (newBackgroundColor) setCurrentBackgroundColor(newBackgroundColor);
      
    } catch (error) {
      console.error('图片更新失败:', error);
      toast.error('图片更新失败，请重试');
    }
  };

  // 按选择的规格裁剪图片
  const cropToSelectedSpec = async (imageUrl: string, spec: typeof ID_PHOTO_SPECS[0]): Promise<string> => {
    const img = await createImage(imageUrl);
    
    // 计算裁剪区域（智能裁剪，保护头部）
    const targetRatio = spec.width / spec.height;
    const imageRatio = img.width / img.height;
    const isSquare = Math.abs(targetRatio - 1) < 0.1;
    
    let cropWidth, cropHeight, cropX, cropY;
    
    if (imageRatio > targetRatio) {
      cropHeight = img.height;
      cropWidth = cropHeight * targetRatio;
      cropX = (img.width - cropWidth) / 2;
      cropY = 0;
    } else {
      cropWidth = img.width;
      cropHeight = cropWidth / targetRatio;
      cropX = 0;
      
      if (isSquare) {
        cropY = img.height * 0.05; // 保护头部
        if (cropY + cropHeight > img.height) {
          cropY = img.height - cropHeight;
        }
      } else {
        cropY = (img.height - cropHeight) / 2;
      }
    }
    
    // 创建按规格裁剪的canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas context not available');
    
    canvas.width = spec.width;
    canvas.height = spec.height;
    
    // 绘制裁剪后的图片到规格尺寸
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, spec.width, spec.height
    );
    
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // 智能背景替换 - 检测是否为排版图片并进行相应处理
  const smartBackgroundReplace = async (imageUrl: string, backgroundColor: string): Promise<string> => {
    // 检查当前图片是否为排版图片（通过比较尺寸）
    const img = await createImage(imageUrl);
    const isLayoutImage = LAYOUT_SIZES.some(size => 
      Math.abs(img.width - size.width) < 50 && Math.abs(img.height - size.height) < 50
    );
    
    if (isLayoutImage && removedBackgroundImage) {
      // 如果是排版图片，需要重新创建排版（用新背景色的单张照片）
      const singlePhotoWithNewBg = await applyBackgroundColor(removedBackgroundImage, backgroundColor);
      const currentLayoutSize = LAYOUT_SIZES.find(size => 
        Math.abs(img.width - size.width) < 50 && Math.abs(img.height - size.height) < 50
      ) || selectedLayoutSize;
      
      return await createPhotoLayout(singlePhotoWithNewBg, currentLayoutSize, selectedSpec);
    } else {
      // 如果是单张图片，直接替换背景
      return await applyBackgroundColor(imageUrl, backgroundColor);
    }
  };

  // 创建证件照排版 - 使用已裁剪的图片进行排版
  const createPhotoLayout = async (photoUrl: string, layoutSize: typeof LAYOUT_SIZES[0], photoSpec: typeof ID_PHOTO_SPECS[0]): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas context not available');
    
    // 加载已裁剪的照片（应该已经是规格尺寸）
    const img = await createImage(photoUrl);
    
    // 设置排版画布尺寸
    canvas.width = layoutSize.width;
    canvas.height = layoutSize.height;
    
    // 填充白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 设置图片间距（像素）
    const spacing = 20;
    
    // 计算可以放置多少张照片（考虑间距）
    const cols = Math.floor((layoutSize.width + spacing) / (photoSpec.width + spacing));
    const rows = Math.floor((layoutSize.height + spacing) / (photoSpec.height + spacing));
    
    // 计算实际使用的尺寸（含间距）
    const usedWidth = cols * photoSpec.width + (cols - 1) * spacing;
    const usedHeight = rows * photoSpec.height + (rows - 1) * spacing;
    
    // 计算居中偏移
    const offsetX = (layoutSize.width - usedWidth) / 2;
    const offsetY = (layoutSize.height - usedHeight) / 2;
    
    // 绘制照片网格（带间距）
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (photoSpec.width + spacing);
        const y = offsetY + row * (photoSpec.height + spacing);
        // 直接使用传入的已裁剪图片，并缩放到规格尺寸
        ctx.drawImage(img, x, y, photoSpec.width, photoSpec.height);
      }
    }
    
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // 处理图片处理
  const handleProcess = async () => {
    if (!uploadedImage) {
      toast.error(t('uploadFirst'));
      return;
    }

    // 如果有裁剪图片，使用裁剪后的图片，否则使用原图
    const imageToProcess = croppedImage || uploadedImage;

    setIsProcessing(true);
    setHasStartedProcessing(true); // 标记已开始处理
    setProcessedImage(null);
    setGenerationProgress(0);
    
    try {
      // 压缩图片
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imageToProcess;
      });

      // 修改：使用原图尺寸而不是选择的规格尺寸
      const maxDimension = 800;
      let { width, height } = img;
      
      if (Math.max(width, height) > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width *= scale;
        height *= scale;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      const compressedImage = await compressImageToSize(canvas, 200);
      
      // 修改：传递原图尺寸而不是规格尺寸
      const params = {
        image: compressedImage,
        photoSpec: {
          ...selectedSpec,
          width: Math.round(width),
          height: Math.round(height)
        },
        backgroundColor: selectedBackground.value,
        enhanceQuality: false // 去掉生成模式选择
      };

      // 调用ID照片生成服务
      const taskInfo = await generateIdPhoto(params);
      if (taskInfo.id) {
        setTaskId(taskInfo.id);
        // 开始轮询任务状态
        stopPollingRef.current = startIdPhotoPolling(taskInfo.id, {
          onProgress: (progress: number) => {
            setGenerationProgress(progress);
          },
          onSuccess: (result: any) => {
            // 修复：正确获取结果图片URL
            let imageUrl = '';
            if (result.output_url) {
              imageUrl = result.output_url;
            } else if (result.result && result.result.length > 0) {
              imageUrl = result.result[0];
            }
            setProcessedImage(imageUrl);
            setOriginalProcessedImage(imageUrl); // 保存原始处理结果
            setIsProcessing(false);
            setGenerationProgress(100);
            toast.success(t('generateSuccess'));
          },
          onError: (error: string) => {
            setIsProcessing(false);
            setGenerationProgress(0);
            toast.error(`${t('processFailed')}: ${error}`);
          },
          onStatusUpdate: (status: string) => {
            console.log('任务状态更新:', status);
          }
        });
      }
    } catch (error) {
      console.error('处理失败:', error);
      setIsProcessing(false);
      setGenerationProgress(0);
      toast.error(t('processFailed'));
    }
  };

  // 修复：改进下载功能，解决跨域问题
  const handleDownloadWithSpec = async () => {
    if (!processedImage) {
      toast.error(t('noDownloadImage'));
      return;
    }

    try {
      // 检查是否为排版图片
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = processedImage;
      });

      const isLayoutImage = LAYOUT_SIZES.some(size => 
        Math.abs(img.width - size.width) < 50 && Math.abs(img.height - size.height) < 50
      );

      let downloadSpec, filename;
      
      if (isLayoutImage) {
        // 如果是排版图片，使用排版尺寸下载
        const currentLayoutSize = LAYOUT_SIZES.find(size => 
          Math.abs(img.width - size.width) < 50 && Math.abs(img.height - size.height) < 50
        ) || selectedLayoutSize;
        
        downloadSpec = { width: currentLayoutSize.width, height: currentLayoutSize.height };
        filename = `id-photo-layout-${getLocalizedText(t, currentLayoutSize, currentLayoutSize.name)}-${Date.now()}.jpg`;
      } else {
        // 单张图片，使用选择的规格尺寸
        const targetRatio = selectedSpec.width / selectedSpec.height;
        const imageRatio = img.width / img.height;
        const isSquare = Math.abs(targetRatio - 1) < 0.1;
        
        let cropWidth, cropHeight, cropX, cropY;
        
        if (imageRatio > targetRatio) {
          cropHeight = img.height;
          cropWidth = cropHeight * targetRatio;
          cropX = (img.width - cropWidth) / 2;
          cropY = 0;
        } else {
          cropWidth = img.width;
          cropHeight = cropWidth / targetRatio;
          cropX = 0;
          
          if (isSquare) {
            cropY = img.height * 0.05;
            if (cropY + cropHeight > img.height) {
              cropY = img.height - cropHeight;
            }
          } else {
            cropY = (img.height - cropHeight) / 2;
          }
        }

        // 创建canvas用于调整到指定尺寸
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = selectedSpec.width;
        canvas.height = selectedSpec.height;
        
        ctx?.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, selectedSpec.width, selectedSpec.height
        );

        const imageBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', 0.95);
        });

        const url = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `id-photo-${getLocalizedText(t, selectedSpec, selectedSpec.name)}-${selectedSpec.width}x${selectedSpec.height}-${Date.now()}.jpg`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(t('downloadSuccess'));
        return;
      }

      // 排版图片直接下载
      const imageBlob = await new Promise<Blob>((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = downloadSpec.width;
        canvas.height = downloadSpec.height;
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.95);
      });

      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(t('downloadSuccess'));
    } catch (error) {
      console.error('下载失败:', error);
      toast.error(t('downloadFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="relative">
        <Navbar />
        
        {/* Header */}
        <div className="container mx-auto px-4 pt-20 pb-6 max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="bg-white/60 backdrop-blur-md hover:bg-white/80 shadow-md border border-white/40"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-gray-600 text-sm">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Sidebar - 功能选择面板 */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 backdrop-blur-xl border-white/60 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
{t('functionSelection')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* 主功能选择 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">{t('toolSelection')}</Label>
                    <div className="space-y-2">
                      {/* ID照片制作 */}
                      <div 
                        onClick={() => setActiveTab('idPhotoMaker')}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          activeTab === 'idPhotoMaker' 
                            ? 'border-blue-500 bg-blue-50/80 shadow-md' 
                            : 'border-gray-200 bg-gray-50/40 hover:bg-white/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ImageIcon className={`w-5 h-5 ${activeTab === 'idPhotoMaker' ? 'text-blue-600' : 'text-gray-600'}`} />
                          <div>
                            <div className={`font-medium text-sm ${activeTab === 'idPhotoMaker' ? 'text-gray-800' : 'text-gray-600'}`}>
                              {t('idPhotoMaker')}
                            </div>
                            <div className="text-xs text-gray-600">{t('aiPhotoGeneration')}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 背景替换 */}
                      <div 
                        onClick={() => {
                          if (!processedImage) return;
                          setActiveTab('backgroundReplace');
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          activeTab === 'backgroundReplace' && processedImage
                            ? 'border-green-500 bg-green-50/80 shadow-md' 
                            : processedImage
                            ? 'border-gray-200 bg-gray-50/40 hover:bg-white/60'
                            : 'border-gray-200 bg-gray-50/40 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Palette className={`w-5 h-5 ${
                            activeTab === 'backgroundReplace' && processedImage
                              ? 'text-green-600' 
                              : processedImage 
                              ? 'text-gray-600' 
                              : 'text-gray-400'
                          }`} />
                          <div>
                            <div className={`font-medium text-sm ${
                              activeTab === 'backgroundReplace' && processedImage
                                ? 'text-gray-800' 
                                : processedImage 
                                ? 'text-gray-600' 
                                : 'text-gray-400'
                            }`}>
                              {t('backgroundReplace')}
                            </div>
                            <div className="text-xs text-gray-600">
                              {processedImage ? t('frontendProcessing') : t('needGenerateFirst')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 尺寸调整 */}
                      <div 
                        onClick={() => {
                          if (!processedImage) return;
                          setActiveTab('sizeAdjust');
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          activeTab === 'sizeAdjust' && processedImage
                            ? 'border-purple-500 bg-purple-50/80 shadow-md' 
                            : processedImage
                            ? 'border-gray-200 bg-gray-50/40 hover:bg-white/60'
                            : 'border-gray-200 bg-gray-50/40 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Crop className={`w-5 h-5 ${
                            activeTab === 'sizeAdjust' && processedImage
                              ? 'text-purple-600' 
                              : processedImage 
                              ? 'text-gray-600' 
                              : 'text-gray-400'
                          }`} />
                          <div>
                            <div className={`font-medium text-sm ${
                              activeTab === 'sizeAdjust' && processedImage
                                ? 'text-gray-800' 
                                : processedImage 
                                ? 'text-gray-600' 
                                : 'text-gray-400'
                            }`}>
                              {t('sizeAdjust')}
                            </div>
                            <div className="text-xs text-gray-600">
                              {processedImage ? t('selectPhotoSpecs') : t('needGenerateFirst')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 排版设计 */}
                      <div 
                        onClick={() => {
                          if (!processedImage) return;
                          setActiveTab('layoutArrange');
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          activeTab === 'layoutArrange' && processedImage
                            ? 'border-orange-500 bg-orange-50/80 shadow-md' 
                            : processedImage
                            ? 'border-gray-200 bg-gray-50/40 hover:bg-white/60'
                            : 'border-gray-200 bg-gray-50/40 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Settings className={`w-5 h-5 ${
                            activeTab === 'layoutArrange' && processedImage
                              ? 'text-orange-600' 
                              : processedImage 
                              ? 'text-gray-600' 
                              : 'text-gray-400'
                          }`} />
                          <div>
                            <div className={`font-medium text-sm ${
                              activeTab === 'layoutArrange' && processedImage
                                ? 'text-gray-800' 
                                : processedImage 
                                ? 'text-gray-600' 
                                : 'text-gray-400'
                            }`}>
                              {t('layoutArrange')}
                            </div>
                            <div className="text-xs text-gray-600">
                              {processedImage ? t('paperLayoutOutput') : t('needGenerateFirst')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI生图背景色选择 - 在 idPhotoMaker 时始终显示 */}
                  {activeTab === 'idPhotoMaker' && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium text-gray-700">{t('aiBackgroundColor')}</Label>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {AI_BACKGROUNDS.map((color: any) => (
                            <div key={color.value} className="space-y-1">
                              <div
                                onClick={() => setSelectedBackground(color)}
                                className={`w-full h-8 rounded-md cursor-pointer border transition-all duration-200 ${
                                  selectedBackground.nameKey === color.nameKey 
                                    ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: color.value }}
                              >
                                {selectedBackground.nameKey === color.nameKey && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Check className="w-3 h-3" style={{ color: color.textColor }} />
                                  </div>
                                )}
                              </div>
                              <div className="text-center text-xs text-gray-600">{getLocalizedText(t, color, color.name)}</div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          {t('tipAiBetter')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 背景替换功能 */}
                  {activeTab === 'backgroundReplace' && processedImage && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                                                  <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium text-gray-700">{t('backgroundReplace')}</Label>
                            </div>
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                // 使用原始处理图片进行抠图，确保获得最好的抠图效果
                                const imageToRemoveBg = originalProcessedImage || processedImage;
                                const removedBg = await handleRemoveBackground(imageToRemoveBg);
                                setRemovedBackgroundImage(removedBg);
                                toast.success(t('backgroundRemovalSuccess'));
                              } catch (error) {
                                toast.error(t('backgroundRemovalFailed'));
                              }
                            }}
                            disabled={isRemovingBackground}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isRemovingBackground ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                {t('cutoutInProgress')}
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-3 h-3 mr-1" />
                                {t('oneClickCutout')}
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {removedBackgroundImage && (
                          <>
                            <div className="grid grid-cols-4 gap-2">
                              {FRONTEND_BACKGROUNDS.map((color: any) => (
                                <div key={color.value} className="space-y-1">
                                  <div
                                    onClick={async () => {
                                      // 使用统一的更新函数，应用新背景色
                                      if (removedBackgroundImage) {
                                        await updateImageWithCurrentSettings(undefined, undefined, undefined, color.value);
                                      }
                                    }}
                                    className={`w-full h-6 rounded cursor-pointer border transition-all duration-200 ${
                                      currentBackgroundColor === color.value
                                        ? 'border-green-500 ring-2 ring-green-500/30 scale-105'
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                  >
                                    {currentBackgroundColor === color.value && (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Check className="w-3 h-3" style={{ color: color.textColor }} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-center text-xs text-gray-600">{getLocalizedText(t, color, color.name)}</div>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                              {t('tipFrontendFaster')}
                              <br />
                              <span className="text-green-600">✓ {t('supportLayoutBackground')}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 尺寸调整功能 */}
                  {activeTab === 'sizeAdjust' && processedImage && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">{t('photoSpecs')}</Label>
                        
                        {/* 分类选择 */}
                        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                                                  {Object.entries(ID_PHOTO_CATEGORIES).map(([key, category]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`px-2 py-1 text-xs rounded transition-all ${
                              selectedCategory === key
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            {getLocalizedText(t, category, category.name)}
                          </button>
                        ))}
                        </div>
                        
                                                {/* 规格列表 */}
                        <div className="space-y-1">
                          {ID_PHOTO_CATEGORIES[selectedCategory as keyof typeof ID_PHOTO_CATEGORIES]?.specs.map((spec) => (
                            <div
                              key={spec.id}
                              onClick={async () => {
                                // 使用统一的更新函数，保持当前的排版和背景设置
                                await updateImageWithCurrentSettings(undefined, spec);
                              }}
                              className={`p-2 rounded cursor-pointer transition-all duration-200 border ${
                                selectedSpec.id === spec.id
                                  ? 'border-purple-500 bg-purple-50/80 shadow-sm'
                                  : 'border-gray-200 bg-white/40 hover:bg-white/60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900 text-xs">{getLocalizedText(t, spec, spec.name)}</div>
                                  <div className="text-xs text-gray-600">{spec.description}</div>
                                </div>
                                {selectedSpec.id === spec.id && (
                                  <Check className="w-3 h-3 text-purple-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 排版设计功能 */}
                  {activeTab === 'layoutArrange' && processedImage && (
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">{t('paperLayout')}</Label>
                        <div className="space-y-2">
                          {/* 移除排版选项 */}
                          <div
                            onClick={async () => {
                              // 移除排版，返回单张图片
                              await updateImageWithCurrentSettings(undefined, undefined, null);
                              toast.success(t('backToOriginal'));
                            }}
                            className={`p-3 rounded cursor-pointer border transition-all duration-200 ${
                              !isInLayoutMode
                                ? 'border-blue-500 bg-blue-50/80 shadow-sm'
                                : 'border-gray-200 bg-white/40 hover:bg-white/60'
                            }`}
                          >
                                                         <div className="flex items-center justify-between">
                               <div>
                                 <div className="font-medium text-gray-900 text-sm">{t('singlePhoto')}</div>
                                 <div className="text-xs text-gray-600">{t('removeLayout')}</div>
                               </div>
                               <RotateCcw className="w-4 h-4 text-blue-600" />
                             </div>
                          </div>
                          
                          {LAYOUT_SIZES.map((size) => (
                            <div
                              key={size.id}
                              onClick={async () => {
                                // 使用统一的更新函数，应用排版设置
                                await updateImageWithCurrentSettings(undefined, undefined, size);
                                toast.success(`${getLocalizedText(t, size, size.name)}${t('layoutComplete')}`);
                              }}
                              className={`p-3 rounded cursor-pointer border transition-all duration-200 ${
                                isInLayoutMode && selectedLayoutSize.id === size.id
                                  ? 'border-orange-500 bg-orange-50/80 shadow-sm'
                                  : 'border-gray-200 bg-white/40 hover:bg-white/60'
                              }`}
                            >
                                                                <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">{getLocalizedText(t, size, size.name)}</div>
                                      <div className="text-xs text-gray-600">{size.description}</div>
                                    </div>
                                    <Settings className="w-4 h-4 text-orange-600" />
                                  </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          {t('tipAutoLayout')}
                        </div>
                        

                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* 图片上传区域 */}
              {!isUploaded && (
                <Card className="bg-white/80 backdrop-blur-xl border-white/60 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                      {t('uploadPhoto')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium text-gray-700 mb-2">{t('clickToUpload')}</p>
                      <p className="text-sm text-gray-500">{t('uploadDescription')}</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{t('uploadProgress')}</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Preview & Processing Section */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/60 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                      <ImageIcon className="w-4 h-4 text-white" />
                    </div>
                    {t('previewAndProcess')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`${hasStartedProcessing ? 'space-y-6' : 'grid md:grid-cols-1 gap-6'}`}>
                    
                    {/* 原图预览 - 开始处理后移到上方并缩小 */}
                    {hasStartedProcessing ? (
                      <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-lg border border-white/60">
                        <div className="w-20 h-24 bg-gradient-to-br from-gray-100/80 to-gray-200/80 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                          {(croppedImage || uploadedImage) ? (
                            <Image
                              src={croppedImage || uploadedImage || ''}
                              alt="Original Image"
                              width={80}
                              height={96}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm font-medium text-gray-700">{t('originalPreview')}</Label>
                          {originalImageSize && (
                            <p className="text-xs text-gray-600 mt-1">
                              {t('originalSize', { width: originalImageSize.width, height: originalImageSize.height })}
                              {croppedImage && <span className="text-green-600 ml-2">{t('cropped')}</span>}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCropper(true)}
                            className="bg-white/80 backdrop-blur-md border-white/60 hover:bg-white text-gray-700"
                          >
                            <Crop className="w-3 h-3 mr-1" />
                            {t('crop')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsUploaded(false);
                              setUploadedImage(null);
                              setProcessedImage(null);
                              setOriginalProcessedImage(null);
                              setRemovedBackgroundImage(null);
                              setCroppedImage(null);
                              setCroppedForSpec(null); // 重置规格裁剪图片
                              setCurrentBackgroundColor(null); // 重置背景色
                              setIsInLayoutMode(false); // 重置排版模式
                              setHasStartedProcessing(false); // 重置处理状态
                            }}
                            className="bg-white/80 backdrop-blur-md border-white/60 hover:bg-white text-gray-700"
                          >
                            {t('reupload')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-gray-700">{t('originalPreview')}</Label>
                          {isUploaded && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowCropper(true)}
                                className="bg-white/80 backdrop-blur-md border-white/60 hover:bg-white text-gray-700"
                              >
                                <Crop className="w-4 h-4 mr-2" />
                                {t('crop')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                                              onClick={() => {
                                setIsUploaded(false);
                                setUploadedImage(null);
                                setProcessedImage(null);
                                setOriginalProcessedImage(null);
                                setRemovedBackgroundImage(null);
                                setCroppedImage(null);
                                setCroppedForSpec(null); // 重置规格裁剪图片
                                setCurrentBackgroundColor(null); // 重置背景色
                                setIsInLayoutMode(false); // 重置排版模式
                                setHasStartedProcessing(false); // 重置处理状态
                              }}
                                className="bg-white/80 backdrop-blur-md border-white/60 hover:bg-white text-gray-700"
                              >
                                {t('reupload')}
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="min-h-96 max-h-[500px] bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/60 overflow-hidden">
                          {(croppedImage || uploadedImage) ? (
                            <div className="w-full h-full p-4 flex items-center justify-center">
                              <Image
                                src={croppedImage || uploadedImage || ''}
                                alt="Original Image"
                                width={400}
                                height={500}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                                priority
                              />
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p className="text-sm">{t('noImage')}</p>
                            </div>
                          )}
                        </div>
                        {isUploaded && originalImageSize && (
                          <div className="text-center text-sm text-gray-600 bg-white/60 backdrop-blur-md rounded-lg p-2">
                            <p>{t('originalSize', { width: originalImageSize.width, height: originalImageSize.height })}</p>
                            {croppedImage && <p className="text-green-600">{t('cropped')}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 处理结果 - 只在开始处理后显示 */}
                    {hasStartedProcessing && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          {t('idPhotoResult')}
                        </Label>
                                                  <div className="relative">
                            <div className="w-full min-h-96 max-h-[900px] bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/60 overflow-hidden relative">
                            {isProcessing ? (
                              <div className="text-center space-y-4 py-8">
                                <div className="relative">
                                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-medium text-blue-600">{generationProgress}%</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">
                                    {t('generating')}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {generationProgress < 20 ? t('analyzing') :
                                     generationProgress < 60 ? t('processingBackground') :
                                     generationProgress < 90 ? t('optimizingQuality') : t('almostDone')}
                                  </p>
                                  {generationProgress > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${generationProgress}%` }}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : processedImage ? (
                              <div className="w-full h-full p-4 flex items-center justify-center">
                                <Watermark>
                                  <div className="relative max-w-full max-h-full flex items-center justify-center">
                                    <Image
                                      src={processedImage || ''}
                                      alt="Processing Result"
                                      width={400}
                                      height={500}
                                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                      priority
                                    />
                                  </div>
                                </Watermark>
                              </div>
                            ) : (
                              <div className="text-center text-gray-500 py-8">
                                <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">{t('waitingForProcess')}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* 尺寸说明和操作按钮区域 */}
                          {processedImage && (
                            <div className="space-y-3">
                              <DimensionInfo 
                                spec={selectedSpec}
                                show={true}
                                t={t}
                              />
                              
                              {/* 恢复原图按钮 - 移到预览区域 */}
                              {originalProcessedImage && processedImage !== originalProcessedImage && (
                                <div className="flex justify-center">
                                                                     <Button
                                     size="sm"
                                     onClick={() => {
                                       setProcessedImage(originalProcessedImage);
                                       setCroppedForSpec(null); // 清除规格裁剪
                                       setCurrentBackgroundColor(null); // 清除背景色
                                       setIsInLayoutMode(false); // 退出排版模式
                                       toast.success(t('backToOriginal'));
                                     }}
                                     className="bg-orange-600 hover:bg-orange-700 text-white"
                                   >
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    {t('backToOriginal')}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-4 mt-6">
                    {/* 生成按钮 - 只在证件照制作tab显示 */}
                    {activeTab === 'idPhotoMaker' && (
                      <Button
                        onClick={handleProcess}
                        disabled={!uploadedImage || isProcessing}
                        className={`h-11 ${processedImage ? 'flex-1' : 'flex-1'} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('generating')} {generationProgress > 0 && `${generationProgress}%`}
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            {t('generateIdPhoto')}
                          </>
                        )}
                      </Button>
                    )}
                    
                    {/* 下载按钮 - 有图片时显示 */}
                    {processedImage && (
                      <Button
                        onClick={handleDownloadWithSpec}
                        disabled={!processedImage}
                        className={`h-11 px-6 ${
                          activeTab === 'idPhotoMaker' 
                            ? 'flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-green-500/25' 
                            : 'flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-green-500/25'
                        } transition-all duration-300 disabled:opacity-50`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('downloadWithSpec', { spec: getLocalizedText(t, selectedSpec, selectedSpec.nameKey) })}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 裁剪模态框 */}
      {showCropper && uploadedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('cropImage')}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCropper(false)}
              >
                {t('cancel')}
              </Button>
            </div>
            
            <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={uploadedImage || ''}
                crop={crop}
                zoom={zoom}
                aspect={selectedSpec.width / selectedSpec.height}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-4">
                <Label>{t('zoom')}:</Label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-32"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(rotation + 90)}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              <Button onClick={handleCropApply}>
                {t('apply')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
