'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
  Check,
  Camera,
  Scissors,
  Layout,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Maximize2,
  Grid
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import Navbar from '@/components/navbar';
import { generateIdPhoto, getIdPhotoTaskStatus } from './id-photo-generator';
import { 
  ID_PHOTO_SPECS, 
  ID_PHOTO_CATEGORIES, 
  AI_BACKGROUNDS, 
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
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="text-white/15 font-bold text-4xl transform rotate-45 select-none"
            style={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontFamily: 'Arial, sans-serif'
            }}
          >
          {t('watermark')}
        </div>
        </div>
        
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-white/40 text-sm font-semibold transform rotate-12 select-none"
              style={{
                left: `${(i % 5) * 20 + 10}%`,
                top: `${Math.floor(i / 5) * 25 + 12}%`,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {t('watermark')}
            </div>
          ))}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-green-500/3 via-transparent to-red-500/3"></div>
      </div>
    </div>
  );
};

// 工具函数
const getBase64Size = (base64String: string): number => {
  const base64Data = base64String.split(',')[1] || base64String;
  const padding = (base64Data.match(/=/g) || []).length;
  return Math.floor((base64Data.length * 3) / 4) - padding;
};

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

// 轮询接口
interface IdPhotoPollingCallbacks {
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onStatusUpdate?: (status: string) => void;
}

const startIdPhotoPolling = (
  taskId: string,
  callbacks: IdPhotoPollingCallbacks
): (() => void) => {
  let isPolling = true;
  let pollCount = 0;
  const maxPollCount = 120;
  
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
      
      callbacks.onStatusUpdate?.(taskInfo.status);
      
      const progressMap: { [key: string]: number } = {
        [TaskStatus.PENDING]: 5,
        [TaskStatus.PROCESSING]: 60,
        [TaskStatus.COMPLETED]: 100,
        [TaskStatus.FAILED]: 0
      };
      
      const progress = progressMap[taskInfo.status] || 0;
      callbacks.onProgress?.(progress);
      
      if (taskInfo.status === TaskStatus.COMPLETED) {
        isPolling = false;
        callbacks.onSuccess?.(taskInfo);
        return;
      }
      
      if (taskInfo.status === TaskStatus.FAILED) {
        isPolling = false;
        callbacks.onError?.(taskInfo.message || '处理失败');
        return;
      }
      
      setTimeout(poll, 1000);
    } catch (error) {
      console.error('轮询错误:', error);
      setTimeout(poll, 3000);
    }
  };
  
  poll();
  
  return () => {
    isPolling = false;
  };
};

export default function IdPhotoPage() {
  const t = useTranslations('HomePage.idPhoto');
  const router = useRouter();
  
  // 基础状态
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalProcessedImage, setOriginalProcessedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [layoutImage, setLayoutImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);

  // 功能选择状态
  const [activeTab, setActiveTab] = useState('idPhotoMaker');
  const [showSidePanel, setShowSidePanel] = useState<string | null>('idPhotoMaker');
  const [isInLayoutMode, setIsInLayoutMode] = useState(false);

  // 选择状态
  const [selectedSpec, setSelectedSpec] = useState(ID_PHOTO_SPECS[0]);
  const [selectedBgColor, setSelectedBgColor] = useState('#FFFFFF');
  const [selectedLayout, setSelectedLayout] = useState(LAYOUT_SIZES[0]);

  // 裁剪相关
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // 文件上传ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取图片尺寸
  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('fileTooLarge'));
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageSrc = e.target?.result as string;
        setUploadedImage(imageSrc);
        setProcessedImage(null);
        setOriginalProcessedImage(null);
        setCroppedImage(null);
        setLayoutImage(null);
        setIsInLayoutMode(false);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        
        // 重新上传时自动打开idPhotoMaker
        setShowSidePanel('idPhotoMaker');
        
        const dimensions = await getImageDimensions(imageSrc);
        setOriginalImageSize(dimensions);
        
        // 提示可以重新选择背景色进行生图
        toast.success(t('uploadSuccess') + '，可以重新选择背景色进行生图');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('uploadError'));
    }
  };

  // 裁剪回调
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropApply = useCallback(async () => {
    if (!uploadedImage || !croppedAreaPixels) return;
    
    try {
      const croppedImageUrl = await getCroppedImg(uploadedImage, croppedAreaPixels, rotation);
      setCroppedImage(croppedImageUrl);
      setShowCropper(false);
      toast.success(t('cropSuccess'));
    } catch (error) {
      console.error('Crop error:', error);
      toast.error(t('cropError'));
    }
  }, [uploadedImage, croppedAreaPixels, rotation, t]);
        
  // 处理生成
  const handleProcess = async () => {
    if (!uploadedImage) {
      toast.error(t('selectPhotoFirst'));
      return;
      }
      
    const imageToProcess = croppedImage || uploadedImage;
    setIsProcessing(true);
    setGenerationProgress(0);

    try {
      const response = await generateIdPhoto({
        image: imageToProcess,
        photoSpec: selectedSpec,
        backgroundColor: selectedBgColor
      });
            
      const stopPolling = startIdPhotoPolling(response.id, {
        onProgress: setGenerationProgress,
        onSuccess: (result) => {
          let imageUrl = '';
          if (result.output_url) {
            imageUrl = result.output_url;
          } else if (result.result && result.result.length > 0) {
            imageUrl = result.result[0];
          }
          setProcessedImage(imageUrl);
          setOriginalProcessedImage(imageUrl);
          setIsProcessing(false);
          toast.success(t('generateSuccess'));
        },
        onError: (error) => {
          toast.error(error);
          setIsProcessing(false);
        }
      });
      
    } catch (error) {
      console.error('生成失败:', error);
      toast.error(t('generateFailed'));
      setIsProcessing(false);
    }
  };

  // 按选择的规格裁剪图片
  const cropToSelectedSpec = async (imageUrl: string, spec: typeof ID_PHOTO_SPECS[0]): Promise<string> => {
    const img = await createImage(imageUrl);
    
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
        cropY = img.height * 0.05;
        if (cropY + cropHeight > img.height) {
          cropY = img.height - cropHeight;
        }
      } else {
        cropY = (img.height - cropHeight) / 2;
      }
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas context not available');
    
    canvas.width = spec.width;
    canvas.height = spec.height;
    
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, spec.width, spec.height
    );
    
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // 创建证件照排版
  const createPhotoLayout = async (photoUrl: string, layoutSize: typeof LAYOUT_SIZES[0], photoSpec: typeof ID_PHOTO_SPECS[0]): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas context not available');
    
    const img = await createImage(photoUrl);
    
    canvas.width = layoutSize.width;
    canvas.height = layoutSize.height;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const spacing = 20;
    const cols = Math.floor((layoutSize.width + spacing) / (photoSpec.width + spacing));
    const rows = Math.floor((layoutSize.height + spacing) / (photoSpec.height + spacing));
    
    const usedWidth = cols * photoSpec.width + (cols - 1) * spacing;
    const usedHeight = rows * photoSpec.height + (rows - 1) * spacing;
    
    const offsetX = (layoutSize.width - usedWidth) / 2;
    const offsetY = (layoutSize.height - usedHeight) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + col * (photoSpec.width + spacing);
        const y = offsetY + row * (photoSpec.height + spacing);
        ctx.drawImage(img, x, y, photoSpec.width, photoSpec.height);
      }
    }
    
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // 统一的图片更新函数
  const updateImageWithCurrentSettings = async (
    newSpec?: typeof ID_PHOTO_SPECS[0],
    newLayoutSize?: typeof LAYOUT_SIZES[0] | null
  ) => {
    try {
      const currentSpec = newSpec || selectedSpec;
      const currentLayout = newLayoutSize !== undefined ? newLayoutSize : (isInLayoutMode ? selectedLayout : null);
      const baseImage = originalProcessedImage;
      
      if (!baseImage) return;
      
      let workingImage = baseImage;
      
      // 按规格裁剪
      const croppedImg = await cropToSelectedSpec(workingImage, currentSpec);
      
      let finalImage = croppedImg;

      // 应用排版
      if (currentLayout) {
        finalImage = await createPhotoLayout(finalImage, currentLayout, currentSpec);
        setIsInLayoutMode(true);
        setSelectedLayout(currentLayout);
        setLayoutImage(finalImage);
      } else {
        setIsInLayoutMode(false);
        setLayoutImage(null);
      }
      
      setProcessedImage(finalImage);
      if (newSpec) setSelectedSpec(newSpec);
      
    } catch (error) {
      console.error('图片更新失败:', error);
      toast.error('图片更新失败，请重试');
    }
  };

  const handleDownloadWithSpec = async () => {
    if (!processedImage) return;
    
      const link = document.createElement('a');
    link.href = processedImage;
    link.download = `id-photo-${selectedSpec.id}.jpg`;
      link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 backdrop-blur-sm">
      {/* Glass overlay for entire page */}
      <div className="fixed inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none z-0"></div>

      <div className="relative z-10 h-screen flex flex-col">
        <Navbar />
        
        {/* Header with Upload */}
        <section className="pt-20 pb-4 px-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
                className="bg-white/60 backdrop-blur-md hover:bg-white/80 shadow-lg border border-white/40"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
          </div>
        </div>

            {/* Action Buttons in Header */}
            <div className="flex gap-3">
              <Button
                onClick={handleProcess}
                disabled={!uploadedImage || isProcessing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
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
              
              {processedImage && (
                <Button
                  onClick={handleDownloadWithSpec}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('download')}
                </Button>
              )}
                          </div>
                        </div>
        </section>

        {/* Main Content Area - 左右布局 */}
        <div className="flex-1 flex min-h-0">
          {/* 左侧功能菜单栏 */}
          <div className="w-20 bg-white/30 backdrop-blur-xl border-r border-white/50 shadow-xl">
            <div className="p-4 space-y-4">
              {[
                {
                  id: 'idPhotoMaker',
                  icon: Camera,
                  title: t('functions.idPhotoMaker'),
                  gradient: 'from-blue-500 to-blue-600',
                  disabled: false,
                },
                {
                  id: 'backgroundChange',
                  icon: Palette,
                  title: t('functions.backgroundChange'),
                  gradient: 'from-purple-500 to-purple-600',
                  disabled: !originalProcessedImage,
                },
                {
                  id: 'sizeAdjust',
                  icon: Maximize2,
                  title: t('functions.sizeAdjust'),
                  gradient: 'from-green-500 to-green-600',
                  disabled: !originalProcessedImage,
                },
                {
                  id: 'layoutArrange',
                  icon: Grid,
                  title: t('functions.layoutArrange'),
                  gradient: 'from-orange-500 to-orange-600',
                  disabled: !originalProcessedImage,
                }
              ].map((func) => (
                <button
                  key={func.id}
                  onClick={() => !func.disabled && setShowSidePanel(showSidePanel === func.id ? null : func.id)}
                  disabled={func.disabled}
                  className={`w-12 h-12 rounded-xl backdrop-blur-md border border-white/40 shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center ${
                    func.disabled
                      ? 'bg-gray-300/60 text-gray-400 cursor-not-allowed opacity-50'
                      : showSidePanel === func.id
                      ? `bg-gradient-to-r ${func.gradient} text-white shadow-xl`
                      : 'bg-white/60 hover:bg-white/80 text-gray-700'
                  }`}
                  title={func.disabled ? '请先生成证件照' : func.title}
                >
                  <func.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* 中间功能面板 */}
          {showSidePanel && (
            <div className="w-80 bg-white/20 backdrop-blur-xl border-r border-white/30 shadow-xl">
              {showSidePanel === 'idPhotoMaker' && (
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('functions.idPhotoMaker')}</h3>
                  </div>

                  {/* Background Color Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">{t('backgroundColorOptions')}</label>
                    <div className="space-y-3">
                      {AI_BACKGROUNDS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedBgColor(color.value)}
                          className={`w-full h-14 rounded-lg border-2 transition-all duration-200 flex items-center justify-between px-4 ${
                            selectedBgColor === color.value
                              ? 'border-blue-500 bg-blue-50/80'
                              : 'border-gray-200 bg-white/30 hover:bg-white/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: color.value }}
                            />
                            <span className="text-sm font-medium text-gray-900">{color.name}</span>
                          </div>
                          {selectedBgColor === color.value && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {showSidePanel === 'backgroundChange' && (
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('functions.backgroundChange')}</h3>
                  </div>

                  {!originalProcessedImage ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Palette className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm mb-2">功能暂时不可用</p>
                      <p className="text-gray-400 text-xs">请先生成证件照后再使用此功能</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {AI_BACKGROUNDS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setSelectedBgColor(color.value)}
                          className={`w-full h-12 rounded-lg border-2 transition-all duration-200 ${
                            selectedBgColor === color.value
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showSidePanel === 'sizeAdjust' && (
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('functions.sizeAdjust')}</h3>
                  </div>

                  {!originalProcessedImage ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Maximize2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm mb-2">功能暂时不可用</p>
                      <p className="text-gray-400 text-xs">请先生成证件照后再使用此功能</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ID_PHOTO_SPECS.slice(0, 12).map((spec) => (
                        <button
                          key={spec.id}
                          onClick={async () => {
                            setSelectedSpec(spec);
                            if (originalProcessedImage) {
                              await updateImageWithCurrentSettings(spec);
                            }
                          }}
                          className={`w-full p-3 text-left rounded-lg border transition-all duration-200 backdrop-blur-md ${
                            selectedSpec?.id === spec.id
                              ? 'border-blue-500 bg-blue-50/80'
                              : 'border-gray-200 bg-white/30 hover:bg-white/50'
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-900">{spec.name}</div>
                          <div className="text-xs text-gray-500">{spec.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showSidePanel === 'layoutArrange' && (
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                      <Grid className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('functions.layoutArrange')}</h3>
                  </div>

                  {!originalProcessedImage ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Grid className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm mb-2">功能暂时不可用</p>
                      <p className="text-gray-400 text-xs">请先生成证件照后再使用此功能</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={async () => {
                          if (originalProcessedImage) {
                            await updateImageWithCurrentSettings(undefined, null);
                            toast.success('恢复原图');
                          }
                        }}
                        className={`w-full p-4 rounded-xl transition-all border-2 ${
                          !isInLayoutMode
                            ? 'border-blue-500 bg-blue-50/80 shadow-md'
                            : 'border-white/40 bg-white/30 hover:bg-white/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">单张照片</div>
                            <div className="text-xs text-gray-600">移除排版</div>
                          </div>
                          <RotateCcw className="w-5 h-5 text-blue-600" />
                        </div>
                      </button>
                      
                      <div className="space-y-2">
                        {LAYOUT_SIZES.map((layout) => (
                          <button
                            key={layout.id}
                            onClick={async () => {
                              if (originalProcessedImage) {
                                await updateImageWithCurrentSettings(undefined, layout);
                                toast.success(`${layout.name}排版完成`);
                              }
                            }}
                            className={`w-full p-3 text-left rounded-lg border transition-all duration-200 backdrop-blur-md ${
                              isInLayoutMode && selectedLayout?.id === layout.id
                                ? 'border-orange-500 bg-orange-50/80'
                                : 'border-gray-200 bg-white/30 hover:bg-white/50'
                            }`}
                          >
                            <div className="font-medium text-sm text-gray-900">{layout.name}</div>
                            <div className="text-xs text-gray-500">{layout.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 右侧工作区 - 上下布局 */}
          <div className="flex-1 flex flex-col min-h-0 p-6 gap-4">
            {/* 上半部分：上传区域 */}
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-4 shadow-lg flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                      <input
                        type="file"
                    accept=".jpeg,.jpg,.png,.webp"
                        onChange={handleFileUpload}
                    ref={fileInputRef}
                        className="hidden"
                      />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadedImage ? t('changePhoto') : t('uploadPhoto')}
                  </Button>
                  
                  {uploadedImage && originalImageSize && (
                    <>
                      <div className="text-sm text-gray-600">
                              {t('originalSize', { width: originalImageSize.width, height: originalImageSize.height })}
                              {croppedImage && <span className="text-green-600 ml-2">{t('cropped')}</span>}
                        </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCropper(true)}
                        className="bg-white/60 backdrop-blur-md border-white/60"
                          >
                            <Crop className="w-3 h-3 mr-1" />
                            {t('crop')}
                          </Button>
                    </>
                          )}
                        </div>
                
                {uploadedImage && (
                  <div className="w-16 h-20 rounded-lg overflow-hidden shadow-md">
                            <Image
                      src={croppedImage || uploadedImage}
                      alt="Uploaded Photo"
                      width={64}
                      height={80}
                      className="w-full h-full object-cover"
                            />
                            </div>
                          )}
                        </div>
                          </div>

            {/* 下半部分：预览区域 */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">ID Photo Result</h2>
                {(processedImage || croppedImage || layoutImage) && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownloadWithSpec}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('common.download')}
                    </Button>
                  </div>
                )}
              </div>

              {/* 图片显示区域 */}
              <div className="flex items-center justify-center bg-gray-50/50 rounded-xl backdrop-blur-md border border-white/50 min-h-[500px]">
                {!uploadedImage ? (
                  <div className="text-center text-gray-500">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">{t('uploadToStart')}</p>
                    <p className="text-sm">{t('selectPhotoFirst')}</p>
                  </div>
                ) : isProcessing ? (
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">{t('processing')}</p>
                    <p className="text-sm text-gray-600">{t('pleaseWait')}</p>
                    {generationProgress > 0 && (
                      <div className="mt-4 w-64 mx-auto">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${generationProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{generationProgress}%</p>
                      </div>
                    )}
                  </div>
                ) : processedImage ? (
                  <div className="flex items-center justify-center h-full w-full">
                    <Watermark>
                      <Image
                        src={processedImage}
                        alt="Processed ID Photo"
                        width={isInLayoutMode ? 800 : 400}
                        height={isInLayoutMode ? 600 : 500}
                        className={`rounded-xl shadow-2xl object-contain ${
                          isInLayoutMode 
                            ? 'max-w-[calc(100%-3rem)] max-h-[calc(100vh-350px)]' 
                            : 'max-w-[70%] max-h-[70%]'
                        }`}
                      />
                    </Watermark>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image
                      src={croppedImage || uploadedImage}
                      alt="Original Photo"
                      width={400}
                      height={500}
                      className="rounded-xl shadow-2xl object-contain max-w-[70%] max-h-[70%]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cropper Modal */}
      {showCropper && uploadedImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-white/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('cropImage')}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCropper(false)}
                  className="bg-white/60 backdrop-blur-md"
              >
                  <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden mb-6">
              <Cropper
                image={uploadedImage}
                crop={crop}
                zoom={zoom}
                aspect={selectedSpec.width / selectedSpec.height}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">{t('zoom')}:</Label>
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
                    className="bg-white/60 backdrop-blur-md"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleCropApply}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {t('apply')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
