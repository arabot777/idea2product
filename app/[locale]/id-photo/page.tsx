'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  Upload, 
  Download, 
  Sparkles, 
  Wand2,
  Check,
  Loader2,
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Ruler as RulerIcon,
  Palette,
  Crop
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { generateIdPhoto, IdPhotoGeneratorParams, IdPhotoTaskInfo, getIdPhotoTaskStatus } from './id-photo-generator';
import { ID_PHOTO_SPECS, ID_PHOTO_BACKGROUNDS } from './constants';
import { TaskStatus } from '@/lib/types/task/enum.bean';

// 简化的水印组件
const Watermark = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    {children}
    <div className="absolute inset-0 pointer-events-none">
      {/* 中心水印 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/40 text-xl font-bold rotate-45 select-none">
        PREVIEW
      </div>
      
      {/* 四角水印 */}
      <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-white/25 text-sm font-medium rotate-12 select-none">
        AI Photo
      </div>
      <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2 text-white/25 text-sm font-medium -rotate-12 select-none">
        Demo Only
      </div>
      <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 translate-y-1/2 text-white/25 text-sm font-medium -rotate-12 select-none">
        Sample
      </div>
      <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 text-white/25 text-sm font-medium rotate-12 select-none">
        Watermark
      </div>
    </div>
  </div>
);

export default function IdPhotoPage() {
  const t = useTranslations('HomePage');
  const router = useRouter();
  const [activeFunction, setActiveFunction] = useState('create');
  const [selectedSpec, setSelectedSpec] = useState(ID_PHOTO_SPECS[0]);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskInfo, setTaskInfo] = useState<IdPhotoTaskInfo | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const stopPollingRef = useRef<(() => void) | null>(null);

  // 轮询函数 - 客户端实现
  const startIdPhotoPolling = useCallback((
    taskId: string,
    callbacks: {
      onProgress?: (progress: number) => void;
      onSuccess?: (result: string[]) => void;
      onError?: (message: string) => void;
      onStatusUpdate?: (taskInfo: IdPhotoTaskInfo) => void;
    }
  ): (() => void) => {
    let pollingInterval: NodeJS.Timeout | null = null;

    // 开始轮询
    const startPolling = () => {
      // 清除现有轮询
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }

      // 设置轮询间隔
      pollingInterval = setInterval(async () => {
        try {
          const taskInfo = await getIdPhotoTaskStatus(taskId);
          
          // 更新状态回调
          callbacks.onStatusUpdate?.(taskInfo);

          // 更新进度回调
          if (taskInfo.progress !== undefined) {
            callbacks.onProgress?.(taskInfo.progress);
          }

          // 检查任务是否完成
          if (taskInfo.status === TaskStatus.COMPLETED || taskInfo.status === TaskStatus.FAILED || taskInfo.status === TaskStatus.CANCELLED) {
            // 停止轮询
            if (pollingInterval) {
              clearInterval(pollingInterval);
              pollingInterval = null;
            }

            if (taskInfo.status === TaskStatus.COMPLETED && taskInfo.result) {
              // 处理成功结果
              callbacks.onSuccess?.(taskInfo.result as string[]);
            } else if (taskInfo.status === TaskStatus.FAILED) {
              // 处理失败
              callbacks.onError?.(taskInfo.message || "证件照生成失败，请重试");
            } else if (taskInfo.status === TaskStatus.CANCELLED) {
              // 处理取消
              callbacks.onError?.(taskInfo.message || "证件照生成已取消，请重试");
            }
          }
        } catch (error) {
          console.error("轮询任务状态失败:", error);
          // 不停止轮询，继续等待状态更新
          callbacks.onError?.(`获取生成状态失败: ${error instanceof Error ? error.message : "未知错误"}`);
        }
      }, 2000); // 每2秒轮询一次
    };

    // 立即开始轮询
    startPolling();

    // 返回停止轮询的函数
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    };
  }, []);

  // 功能选项
  const functions = [
    {
      id: 'create',
      name: 'ID Photo Creation',
      description: 'AI smart cutout, generate standard ID photos',
      icon: Camera,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50/80 to-blue-100/80'
    },
    {
      id: 'enhance',
      name: 'Photo Enhancement',
      description: 'Smart photo enhancement, improve photo quality',
      icon: Sparkles,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50/80 to-purple-100/80'
    }
  ];

  // 清理轮询
  useEffect(() => {
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
        stopPollingRef.current = null;
      }
    };
  }, []);

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件大小 (5MB限制)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds limit (5MB)');
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setProcessedImage(null);
      setIsUploaded(true);
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

    toast.success('Image uploaded successfully');
  };

  // 处理图片拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX - cropPosition.x;
    const startY = e.clientY - cropPosition.y;

    const handleMouseMove = (e: MouseEvent) => {
      setCropPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [cropPosition]);

  // 处理图片处理
  const handleProcess = async () => {
    if (!uploadedImage) {
      toast.error('请先上传图片');
      return;
    }

    setIsProcessing(true);
    setProcessedImage(null);
    setGenerationProgress(0);
    
    try {
      // 构建生成参数
      const params: IdPhotoGeneratorParams = {
        image: uploadedImage,
        photoSpec: selectedSpec,
        backgroundColor: backgroundColor,
        enhanceQuality: activeFunction === 'enhance'
      };

      // 调用ID照片生成服务
      const taskInfo = await generateIdPhoto(params);
      console.log("generateIdPhoto", taskInfo);
      if (taskInfo.id) {
        setTaskId(taskInfo.id);
        console.log("taskInfo.id", taskInfo.id);
        // 开始轮询任务状态
        console.log("startPolling start", taskInfo.id);
        stopPollingRef.current = startIdPhotoPolling(taskInfo.id, {
          onProgress: (progress: number) => {
            setGenerationProgress(progress);
          },
          onSuccess: (result: string[]) => {
            setProcessedImage(result[0]);
            setIsProcessing(false);
            toast.success('证件照生成成功！');
          },
          onError: (message: string) => {
            setIsProcessing(false);
            toast.error(message || '生成失败，请重试');
          },
          onStatusUpdate: (taskInfo: IdPhotoTaskInfo) => {
            setTaskInfo(taskInfo);
          }
        });
        console.log("startPolling end", taskInfo.id);
      } else {
        setIsProcessing(false);
        toast.error(taskInfo.message || '提交证件照生成请求失败');
      }
    } catch (error) {
      console.error('生成证件照错误:', error);
      setIsProcessing(false);
      toast.error('发送生成请求失败，请稍后重试');
    }
  };

  // 下载图片
  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `ID_Photo_${selectedSpec.name}_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded successfully');
  };

  const currentFunction = functions.find(f => f.id === activeFunction);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 backdrop-blur-sm">
      {/* Glass overlay */}
      <div className="fixed inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none z-0"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        {/* Header */}
        <div className="container mx-auto px-6 pt-24 pb-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="bg-white/40 backdrop-blur-md hover:bg-white/60 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI ID Photo Creator</h1>
              <p className="text-gray-600 mt-1">Smart cutout, generate professional ID photos</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 pb-16">
          <div className={`grid gap-8 transition-all duration-500 ${
            isUploaded ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          }`}>
            
            {/* Left Sidebar - Functions - 恢复之前的设计 */}
            <div className={`transition-all duration-500 ${
              isUploaded ? 'lg:col-span-1' : 'lg:col-span-1'
            }`}>
              <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    Function Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {functions.map((func) => (
                    <div
                      key={func.id}
                      onClick={() => setActiveFunction(func.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                        activeFunction === func.id 
                          ? 'border-blue-500 bg-blue-50/80 backdrop-blur-md shadow-lg' 
                          : 'border-transparent bg-white/30 backdrop-blur-md hover:bg-white/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${func.color} flex items-center justify-center shadow-lg`}>
                          <func.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{func.name}</h3>
                          <p className="text-sm text-gray-600">{func.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Settings Panel - Tab形式 */}
                  {activeFunction === 'create' && (
                    <div className="mt-6 p-4 bg-white/30 backdrop-blur-md rounded-xl border border-white/40">
                      <h4 className="font-semibold text-gray-900 mb-4">ID Photo Settings</h4>
                      
                      <Tabs defaultValue="specs" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white/40 backdrop-blur-md p-1">
                          <TabsTrigger value="specs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm">
                            <RulerIcon className="w-4 h-4 mr-2" />
                            Specs
                          </TabsTrigger>
                          <TabsTrigger value="background" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm">
                            <Palette className="w-4 h-4 mr-2" />
                            Background
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="specs" className="mt-4">
                          {/* Photo Spec Selection - 平铺展开 */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Photo Specifications</Label>
                            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                              {ID_PHOTO_SPECS.map((spec) => (
                                <div
                                  key={spec.id}
                                  onClick={() => setSelectedSpec(spec)}
                                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                                    selectedSpec.id === spec.id
                                      ? 'border-blue-500 bg-blue-50/80 backdrop-blur-md shadow-lg'
                                      : 'border-white/40 bg-white/20 backdrop-blur-md hover:bg-white/40'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">{spec.name}</div>
                                      <div className="text-xs text-gray-600">{spec.description}</div>
                                      <div className="text-xs text-gray-500">{spec.usage}</div>
                                    </div>
                                    {selectedSpec.id === spec.id && (
                                      <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="background" className="mt-4">
                          {/* Background Color Selection */}
                          <div className="space-y-4">
                            <Label className="text-sm font-medium text-gray-700">Background Color</Label>
                            <div className="grid grid-cols-3 gap-3">
                              {ID_PHOTO_BACKGROUNDS.map((color) => (
                                <div key={color.value} className="space-y-2">
                                  <div
                                    onClick={() => setBackgroundColor(color.value)}
                                    className={`w-full h-12 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                                      backgroundColor === color.value 
                                        ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105' 
                                        : 'border-white/40 hover:border-white/60'
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                  >
                                    {backgroundColor === color.value && (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Check className="w-4 h-4" style={{ color: color.textColor }} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 text-center">
                                    {color.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Content - Upload and Process */}
            <div className={`transition-all duration-500 ${
              isUploaded ? 'lg:col-span-3' : 'lg:col-span-2'
            }`}>
              <div className="grid gap-6">
                
                {/* Upload Section */}
                {!isUploaded && (
                  <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${currentFunction?.color} flex items-center justify-center shadow-lg`}>
                          {currentFunction && <currentFunction.icon className="w-4 h-4 text-white" />}
                        </div>
                        {currentFunction?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative border-2 border-dashed border-blue-300/50 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400/70 transition-all duration-300 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 backdrop-blur-md"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="space-y-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <Upload className="w-10 h-10 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-medium text-gray-900 mb-3">Click to Upload Image</p>
                            <p className="text-gray-600">Support JPG, PNG formats, max 5MB</p>
                            <p className="text-sm text-gray-500 mt-2">Best results with photos taken against a plain background</p>
                          </div>
                        </div>
                        
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="absolute bottom-6 left-6 right-6">
                            <div className="w-full bg-white/40 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Compact Upload Section */}
                {isUploaded && (
                  <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Image Uploaded</p>
                          <p className="text-sm text-gray-600">Selected: {selectedSpec.name} ({selectedSpec.description})</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsUploaded(false);
                            setUploadedImage(null);
                            setProcessedImage(null);
                          }}
                          className="bg-white/60 backdrop-blur-md border-white/50 hover:bg-white/80"
                        >
                          Change Image
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Preview and Process Section - 简化设计 */}
                <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                      Preview & Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      
                      {/* Original Image - 简化设计，去掉标尺和裁剪框 */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Original Image</Label>
                        <div className="aspect-square bg-gradient-to-br from-gray-100/60 to-gray-200/60 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/40 overflow-hidden relative">
                          {uploadedImage ? (
                            <div
                              ref={imageRef}
                              className="relative w-full h-full cursor-move flex items-center justify-center"
                              onMouseDown={handleMouseDown}
                            >
                              <div
                                className="relative"
                                style={{
                                  transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropScale})`,
                                  transition: isDragging ? 'none' : 'transform 0.2s ease'
                                }}
                              >
                                <Image
                                  src={uploadedImage}
                                  alt="Original Image"
                                  width={400}
                                  height={400}
                                  className="max-w-full max-h-full object-contain"
                                  draggable={false}
                                />
                              </div>
                              
                              {/* 简单的选择提示 */}
                              <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                Drag to adjust position
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500">
                              <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                              <p className="text-sm">No Image</p>
                            </div>
                          )}
                        </div>
                        
                        {/* 控制按钮 */}
                        {uploadedImage && (
                          <div className="flex justify-center gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCropScale(Math.max(0.5, cropScale - 0.1))}
                              className="bg-white/60 backdrop-blur-md border-white/50"
                            >
                              <ZoomOut className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCropScale(Math.min(2, cropScale + 0.1))}
                              className="bg-white/60 backdrop-blur-md border-white/50"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCropPosition({ x: 0, y: 0 });
                                setCropScale(1);
                              }}
                              className="bg-white/60 backdrop-blur-md border-white/50"
                            >
                              <Move className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Processed Image */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          ID Photo Result ({selectedSpec.description})
                        </Label>
                        <div className="aspect-square bg-gradient-to-br from-gray-100/60 to-gray-200/60 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/40 overflow-hidden">
                          {isProcessing ? (
                            <div className="text-center space-y-4">
                              <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">{generationProgress}%</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">AI正在生成证件照...</p>
                                <p className="text-xs text-gray-500">
                                  {generationProgress < 20 ? '正在分析图片...' :
                                   generationProgress < 60 ? '正在处理背景...' :
                                   generationProgress < 90 ? '正在优化质量...' : '即将完成...'}
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
                            <Watermark>
                              <div className="relative w-full h-full flex items-center justify-center p-4">
                                <div 
                                  className="relative bg-white shadow-lg overflow-hidden"
                                  style={{
                                    width: `${(selectedSpec.mmWidth / Math.max(selectedSpec.mmWidth, selectedSpec.mmHeight)) * 70}%`,
                                    height: `${(selectedSpec.mmHeight / Math.max(selectedSpec.mmWidth, selectedSpec.mmHeight)) * 70}%`,
                                    backgroundColor
                                  }}
                                >
                                  <Image
                                    src={processedImage}
                                    alt="Processing Result"
                                    width={400}
                                    height={400}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </Watermark>
                          ) : (
                            <div className="text-center text-gray-500">
                              <Wand2 className="w-16 h-16 mx-auto mb-3 opacity-50" />
                              <p className="text-sm">Waiting for Processing</p>
                            </div>
                          )}
                        </div>
                        
                        {/* 规格信息 */}
                        {processedImage && (
                          <div className="text-center text-sm text-gray-600 bg-white/40 backdrop-blur-md rounded-lg p-3">
                            <p className="font-medium">{selectedSpec.name}</p>
                            <p>Size: {selectedSpec.description}</p>
                            <p>Usage: {selectedSpec.usage}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                      <Button
                        onClick={handleProcess}
                        disabled={!uploadedImage || isProcessing}
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            生成中... {generationProgress > 0 && `${generationProgress}%`}
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5 mr-2" />
                            生成证件照
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={handleDownload}
                        disabled={!processedImage}
                        variant="outline"
                        className="h-12 px-6 bg-white/60 backdrop-blur-md border-white/50 hover:bg-white/80 disabled:opacity-50"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
