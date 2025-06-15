import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  Upload, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Crop, 
  Sliders, 
  Image as ImageIcon,
  Check
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

// 证件照规格定义
const photoSpecs = {
  '一寸照片': { width: 295, height: 413, name: '一寸照片', description: '25×35mm' },
  '二寸照片': { width: 413, height: 579, name: '二寸照片', description: '35×49mm' },
  '小一寸照片': { width: 260, height: 378, name: '小一寸照片', description: '22×32mm' },
  '小二寸照片': { width: 390, height: 567, name: '小二寸照片', description: '33×48mm' },
  '大一寸照片': { width: 390, height: 567, name: '大一寸照片', description: '33×48mm' },
  '大二寸照片': { width: 472, height: 709, name: '大二寸照片', description: '40×60mm' },
  '护照照片': { width: 390, height: 567, name: '护照照片', description: '33×48mm' },
  '签证照片': { width: 472, height: 709, name: '签证照片', description: '40×60mm' },
};

// 背景颜色选项
const backgroundColors = [
  { name: '白色', value: '#FFFFFF' },
  { name: '蓝色', value: '#2072B8' },
  { name: '红色', value: '#E30E19' },
  { name: '灰色', value: '#CCCCCC' },
  { name: '绿色', value: '#009944' },
  { name: '粉色', value: '#FFC0CB' },
  { name: '黄色', value: '#FFDD00' },
  { name: '紫色', value: '#9966CC' },
];

export function IdPhotoEditor() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '一寸照片';
  
  // 状态
  const [photoType, setPhotoType] = useState(initialType);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [enhancePhoto, setEnhancePhoto] = useState(true);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [autoFaceDetect, setAutoFaceDetect] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageEditorRef = useRef<HTMLDivElement>(null);
  
  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 触发文件选择对话框
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // 处理拍照上传（模拟）
  const handleCameraCapture = () => {
    // 实际项目中应该实现摄像头拍照功能
    alert('摄像头功能需要实际实现');
  };
  
  // 处理图片处理
  const processImage = () => {
    if (!uploadedImage) return;
    
    setProcessing(true);
    
    // 模拟处理过程
    setTimeout(() => {
      // 实际项目中应该调用后端API进行图像处理
      setProcessedImage(uploadedImage);
      setProcessing(false);
    }, 1500);
  };
  
  // 处理图片下载
  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `证件照_${photoType}_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 获取当前选择的照片规格
  const currentSpec = photoSpecs[photoType as keyof typeof photoSpecs] || photoSpecs['一寸照片'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧工具栏 */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="upload">上传照片</TabsTrigger>
                <TabsTrigger value="camera">拍摄照片</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="pt-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary"
                  onClick={triggerFileInput}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">点击或拖拽上传照片</p>
                  <p className="text-xs text-gray-500">支持 JPG、PNG 格式</p>
                </div>
              </TabsContent>
              <TabsContent value="camera" className="pt-4">
                <div className="text-center p-8 border rounded-lg bg-gray-50">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">使用摄像头拍摄照片</p>
                  <Button onClick={handleCameraCapture}>
                    开始拍摄
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="space-y-6">
              <div>
                <Label className="block mb-2 font-medium">证件照规格</Label>
                <Select value={photoType} onValueChange={setPhotoType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择证件照规格" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(photoSpecs).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type} ({photoSpecs[type as keyof typeof photoSpecs].description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block mb-2 font-medium">背景颜色</Label>
                <div className="grid grid-cols-4 gap-2">
                  {backgroundColors.map((color) => (
                    <div 
                      key={color.value}
                      className={`w-full aspect-square rounded-md cursor-pointer border-2 ${backgroundColor === color.value ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setBackgroundColor(color.value)}
                    >
                      {backgroundColor === color.value && (
                        <div className="flex items-center justify-center h-full">
                          <Check className="h-4 w-4 text-black" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {uploadedImage && (
                <>
                  <div>
                    <Label className="block mb-2 font-medium">缩放</Label>
                    <div className="flex items-center">
                      <ZoomOut className="h-4 w-4 mr-2" />
                      <input
                        type="range"
                        value={zoom}
                        min={50}
                        max={150}
                        step={1}
                        onChange={(e) => setZoom(parseInt(e.target.value))}
                        className="flex-1 mx-2"
                      />
                      <ZoomIn className="h-4 w-4 ml-2" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{zoom}%</p>
                  </div>
                  
                  <div>
                    <Label className="block mb-2 font-medium">旋转</Label>
                    <div className="flex items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => setRotation((prev) => (prev - 90) % 360)}
                      >
                        <RotateCw className="h-4 w-4 mr-1" /> 左转
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      >
                        <RotateCw className="h-4 w-4 mr-1" /> 右转
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enhance-photo" className="cursor-pointer">增强照片质量</Label>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <input
                          type="checkbox"
                          id="enhance-photo"
                          checked={enhancePhoto}
                          onChange={(e) => setEnhancePhoto(e.target.checked)}
                          className="sr-only"
                        />
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${enhancePhoto ? 'translate-x-5 bg-primary' : ''}`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="remove-background" className="cursor-pointer">智能抠图</Label>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <input
                          type="checkbox"
                          id="remove-background"
                          checked={removeBackground}
                          onChange={(e) => setRemoveBackground(e.target.checked)}
                          className="sr-only"
                        />
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${removeBackground ? 'translate-x-5 bg-primary' : ''}`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-face-detect" className="cursor-pointer">自动人脸检测</Label>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <input
                          type="checkbox"
                          id="auto-face-detect"
                          checked={autoFaceDetect}
                          onChange={(e) => setAutoFaceDetect(e.target.checked)}
                          className="sr-only"
                        />
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${autoFaceDetect ? 'translate-x-5 bg-primary' : ''}`}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {uploadedImage && !processedImage && (
                <Button 
                  className="w-full" 
                  onClick={processImage}
                  disabled={processing}
                >
                  {processing ? '处理中...' : '生成证件照'}
                </Button>
              )}
              
              {processedImage && (
                <Button 
                  className="w-full" 
                  onClick={downloadImage}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" /> 下载证件照
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 右侧预览区域 */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="text-center mb-4">
              <h3 className="font-medium">{currentSpec.name} 预览</h3>
              <p className="text-sm text-gray-500">{currentSpec.description}</p>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
              {!uploadedImage ? (
                <div className="text-center p-8">
                  <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">请上传或拍摄照片</p>
                </div>
              ) : processedImage ? (
                <div 
                  className="relative"
                  style={{
                    width: `${currentSpec.width / 2}px`,
                    height: `${currentSpec.height / 2}px`,
                    backgroundColor: backgroundColor
                  }}
                >
                  <img 
                    src={processedImage} 
                    alt="处理后的证件照" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div 
                  ref={imageEditorRef}
                  className="relative overflow-hidden"
                  style={{
                    width: `${currentSpec.width / 2}px`,
                    height: `${currentSpec.height / 2}px`,
                    backgroundColor: backgroundColor
                  }}
                >
                  <div
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <img 
                      src={uploadedImage} 
                      alt="上传的照片" 
                      className="max-w-none"
                      style={{
                        maxHeight: `${currentSpec.height * 1.5}px`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {processedImage && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div 
                    className="mx-auto mb-2"
                    style={{
                      width: `${currentSpec.width / 4}px`,
                      height: `${currentSpec.height / 4}px`,
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <img 
                      src={processedImage} 
                      alt="白底证件照" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs">白底</p>
                </div>
                <div className="text-center">
                  <div 
                    className="mx-auto mb-2"
                    style={{
                      width: `${currentSpec.width / 4}px`,
                      height: `${currentSpec.height / 4}px`,
                      backgroundColor: '#2072B8'
                    }}
                  >
                    <img 
                      src={processedImage} 
                      alt="蓝底证件照" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs">蓝底</p>
                </div>
                <div className="text-center">
                  <div 
                    className="mx-auto mb-2"
                    style={{
                      width: `${currentSpec.width / 4}px`,
                      height: `${currentSpec.height / 4}px`,
                      backgroundColor: '#E30E19'
                    }}
                  >
                    <img 
                      src={processedImage} 
                      alt="红底证件照" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs">红底</p>
                </div>
                <div className="text-center">
                  <div 
                    className="mx-auto mb-2"
                    style={{
                      width: `${currentSpec.width / 4}px`,
                      height: `${currentSpec.height / 4}px`,
                      backgroundColor: '#CCCCCC'
                    }}
                  >
                    <img 
                      src={processedImage} 
                      alt="灰底证件照" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs">灰底</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
