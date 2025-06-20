"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Share2, Wand2, Upload, Sparkles, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toolCall } from "@/app/actions/tool/tool-call";
import { toolStatus } from "@/app/actions/tool/tool-status";
import { uploadFile } from "@/app/actions/common/upload";
import { toast } from "sonner";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { AuthStatus, ActiveStatus } from "@/lib/types/permission/permission-config.dto";
import { TaskStatus, TaskStatusType, TaskResultStatus, TaskResultType } from "@/lib/types/task/enum.bean";
import { TaskInfo } from "@/lib/types/task/task.bean";
import { FluxDevUltraFastRequest } from "@/sdk/wavespeed/requests/flux-dev-ultra-fast.request";
import { CODE } from "@/lib/unibee/metric-code";

export default function AIGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [textPrompt, setTextPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskInfo, setTaskInfo] = useState<TaskInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Image generation parameters
  const [imageSize, setImageSize] = useState<string>("1024*1024");
  const [numImages, setNumImages] = useState<number>(1);
  const [inferenceSteps, setInferenceSteps] = useState<number>(28);
  const [guidanceScale, setGuidanceScale] = useState<number>(3.5);
  const [strength, setStrength] = useState<number>(0.8);
  const [seed, setSeed] = useState<number>(-1);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);

  const t = useTranslations("AiGenerator");

  // Poll task status
  useEffect(() => {
    // Cleanup function
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  // start polling task status
  const startPolling = async (id: string) => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    // Ensure generation status is set to true before starting polling
    setIsGenerating(true);

    // Set polling interval
    pollingRef.current = setInterval(async () => {
      try {
        const taskInfo = await toolStatus(id);
        setTaskInfo(taskInfo);

        if (taskInfo.progress !== undefined) {
          setGenerationProgress(taskInfo.progress);
        }

        // If task is completed or failed, stop polling
        if (taskInfo.status === TaskStatus.COMPLETED || taskInfo.status === TaskStatus.FAILED || taskInfo.status === TaskStatus.CANCELLED) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          if (taskInfo.status === TaskStatus.COMPLETED && taskInfo.result) {
            // Process successful result
            handleSuccessResult(taskInfo.result);
            // Only change generation status after successfully processing the result
            setIsGenerating(false);
          } else if (taskInfo.status === TaskStatus.FAILED) {
            // Handle failure
            setErrorMessage(taskInfo.message || "Failed to generate image");
            setIsGenerating(false);
            toast.error(taskInfo.message || "Failed to generate image, please try again later");
          } else if (taskInfo.status === TaskStatus.CANCELLED) {
            // Handle cancellation
            setErrorMessage(taskInfo.message || "Image generation cancelled");
            setIsGenerating(false);
            toast.error(taskInfo.message || "Image generation cancelled, please try again later");
          }
        }
      } catch (error) {
        console.error("Failed to poll task status:", error);
        // Don't stop polling on failure, continue waiting for status updates
        if (error instanceof Error) {
          setErrorMessage(`Error getting task status: ${error.message}`);
          // Use toast.id to prevent showing too many error messages
          toast.error("Error getting image generation status, but will keep trying", {
            duration: 3000,
            id: "polling-error",
          });
        }
      }
    }, 2000); // Poll every 2 seconds
  };

  // Handle successful generation results
  const handleSuccessResult = (result: string[]) => {
    try {
      if (result.length > 0) {
        setGeneratedImages(result);
        setSelectedImageIndex(0);
      } else {
        throw new Error("Generated image list is empty");
      }
    } catch (error) {
      console.error("Error processing generation results:", error);
      setErrorMessage(error instanceof Error ? error.message : "Error processing generation results");
      // Even if processing fails, keep isGenerating=false to prevent UI from getting stuck in loading state
      setIsGenerating(false);
    }
  };

  // Generate image
  const handleGenerate = async () => {
    try {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      setIsGenerating(true);
      setErrorMessage(null);
      setGeneratedImages([]);
      setGenerationProgress(0);

      const request = FluxDevUltraFastRequest.create(
        textPrompt,
        uploadedImage || undefined, // image (convert null to undefined)
        undefined, // mask_image
        strength,
        imageSize,
        inferenceSteps,
        seed,
        guidanceScale,
        numImages,
      );

      if (uploadedImage) {
        request.updateValue({
          image: uploadedImage || undefined,
          strength: strength,
        });
      }
 

      // Call Server Action
      const taskInfo = await toolCall({
        code: CODE.FluxDev,
        requestData: request.value,
      });

      if (taskInfo.id) {
        setTaskId(taskInfo.id);
        // Start polling task status
        startPolling(taskInfo.id);
      } else {
        setIsGenerating(false);
        setErrorMessage(taskInfo.message || "Failed to submit image generation request");
        toast.error(taskInfo.message || "Failed to start image generation");
      }
    } catch (error) {
      console.log("Error in generation:", error);
      setIsGenerating(false);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      toast.error("Error sending generation request, please try again later");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(t("fileSizeExceedsLimit") || "File size exceeds limit (5MB)");
      return;
    }

    try {
      // Resize image
      const resizedFile = await new Promise<File>((resolve) => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(img.src); // Clean up object URL
          const canvas = document.createElement("canvas");
          const MAX_DIMENSION = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              resolve(file); // Use original file if blob creation fails
            }
          }, file.type);
        };
      });

      // Prepare for upload
      const formData = new FormData();
      formData.append("file", resizedFile);

      // Show uploading notification
      toast.loading(t("uploadingImage") || "Uploading image...", {
        id: "image-upload",
      });

      // Call upload API
      const result = await uploadFile(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data?.publicUrl) {
        // Update uploaded image URL
        setUploadedImage(result.data.publicUrl);
        toast.success(t("uploadSuccessDescription") || "Image uploaded successfully", {
          id: "image-upload",
        });
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      toast.error(err.message || t("uploadErrorDescription") || "Image upload failed, please try again", {
        id: "image-upload",
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Control Panel */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white">{t("controlPanelTitle")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="text-to-image" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 p-1">
              <TabsTrigger value="text-to-image" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200">
                <Sparkles className="w-4 h-4 mr-2" />
                {t("textToImageTab")}
              </TabsTrigger>
              <TabsTrigger value="image-to-image" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200">
                <Upload className="w-4 h-4 mr-2" />
                {t("imageToImageTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text-to-image" className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label htmlFor="prompt" className="text-slate-200 font-medium">
                  {t("textToImagePromptLabel")}
                </Label>
                <Textarea
                  id="prompt"
                  placeholder={t("textToImagePlaceholder")}
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="min-h-[120px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Basic Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image-size" className="text-slate-200 font-medium">
                    Image Size
                  </Label>
                  <Select value={imageSize} onValueChange={setImageSize}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="512*512">512 x 512</SelectItem>
                      <SelectItem value="768*768">768 x 768</SelectItem>
                      <SelectItem value="1024*1024">1024 x 1024</SelectItem>
                      <SelectItem value="768*1024">768 x 1024</SelectItem>
                      <SelectItem value="1024*768">1024 x 768</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num-images" className="text-slate-200 font-medium">
                    Number of Images
                  </Label>
                  <Select value={numImages.toString()} onValueChange={(value) => setNumImages(parseInt(value))}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Number of images" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="1">1 image</SelectItem>
                      <SelectItem value="2">2 images</SelectItem>
                      <SelectItem value="4">4 images</SelectItem>
                      <SelectItem value="6">6 images</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Settings (Collapsible) */}
              <div>
                <button
                  type="button"
                  onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)}
                  className="text-blue-400 text-sm flex items-center hover:text-blue-300 transition-colors">
                  {advancedSettingsOpen ? "Hide Advanced Settings" : "Show Advanced Settings"}
                  <span className="ml-1">{advancedSettingsOpen ? "▲" : "▼"}</span>
                </button>

                {advancedSettingsOpen && (
                  <div className="mt-4 p-4 bg-slate-700/30 rounded-lg space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="inference-steps" className="text-slate-200 font-medium">
                          Inference Steps ({inferenceSteps})
                        </Label>
                        <span className="text-slate-400 text-xs">Higher = More detailed but slower</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 text-xs">20</span>
                        <Input
                          id="inference-steps"
                          type="range"
                          min={20}
                          max={50}
                          step={1}
                          value={inferenceSteps}
                          onChange={(e) => setInferenceSteps(parseInt(e.target.value))}
                          className="bg-slate-700/50 border-slate-600"
                        />
                        <span className="text-slate-400 text-xs">50</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="guidance-scale" className="text-slate-200 font-medium">
                          Guidance Scale ({guidanceScale.toFixed(1)})
                        </Label>
                        <span className="text-slate-400 text-xs">Higher = Closer to prompt</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400 text-xs">1.0</span>
                        <Input
                          id="guidance-scale"
                          type="range"
                          min={1.0}
                          max={7.0}
                          step={0.1}
                          value={guidanceScale}
                          onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                          className="bg-slate-700/50 border-slate-600"
                        />
                        <span className="text-slate-400 text-xs">7.0</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="seed" className="text-slate-200 font-medium">
                          Random Seed {seed === -1 ? "(Random)" : `(${seed})`}
                        </Label>
                        <span className="text-slate-400 text-xs">Fixed seed for reproducible results</span>
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          id="seed"
                          type="number"
                          min={-1}
                          max={2147483647}
                          value={seed}
                          onChange={(e) => setSeed(parseInt(e.target.value))}
                          className="bg-slate-700/50 border-slate-600 text-white"
                        />
                        <Button variant="outline" size="sm" onClick={() => setSeed(-1)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          Random
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="image-to-image" className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label htmlFor="image-upload" className="text-slate-200 font-medium">
                  {t("imageToImageUploadLabel")}
                </Label>
                <div className="relative">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="bg-slate-700/50 border-slate-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
                  />
                </div>
                {uploadedImage && (
                  <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                    <Image
                      src={uploadedImage || "/placeholder.svg"}
                      alt={t("uploadedImageAlt")}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover mx-auto shadow-lg"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="modify-prompt" className="text-slate-200 font-medium">
                  {t("imageToImageModifyPromptLabel")}
                </Label>
                <Textarea
                  id="modify-prompt"
                  placeholder={t("imageToImageModifyPromptPlaceholder")}
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="min-h-[100px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !textPrompt.trim()}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50">
            {isGenerating ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                {t("generatingText")}
              </>
            ) : (
              <>
                <Wand2 className="mr-3 h-5 w-5" />
                {t("startGeneratingButton")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Display */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl text-white">{t("resultTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-slate-700/30 rounded-xl flex items-center justify-center overflow-hidden">
            {isGenerating ? (
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                  <div
                    className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto"
                    style={{ animationDelay: "0.1s" }}></div>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">{t("generatingStatus")}</p>
                  <p className="text-slate-400 text-sm">{t("generatingHint")}</p>
                </div>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="w-full space-y-4">
                {/* Selected main image */}
                <div className="relative group mb-4">
                  <Image
                    src={generatedImages[selectedImageIndex] || "/placeholder.svg"}
                    alt={t("generatedImageAlt")}
                    width={512}
                    height={512}
                    className="w-full h-full object-cover rounded-lg shadow-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <div className="flex space-x-3">
                      <Button size="sm" variant="secondary" className="bg-white/90 text-slate-900 hover:bg-white">
                        <Download className="w-4 h-4 mr-2" />
                        {t("downloadButton")}
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/90 text-slate-900 hover:bg-white">
                        <Share2 className="w-4 h-4 mr-2" />
                        {t("shareButton")}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Image grid - shown when there are multiple images */}
                {generatedImages.length > 1 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {generatedImages.map((image, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                          index === selectedImageIndex ? "border-blue-500 ring-2 ring-blue-500/50" : "border-transparent hover:border-slate-500"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}>
                        <Image src={image} alt={`Generated image ${index + 1}`} width={128} height={128} className="w-full h-full object-cover aspect-square" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-600/50 rounded-full flex items-center justify-center mx-auto">
                  <Wand2 className="w-10 h-10 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-300 font-medium">{t("waitingForCreation")}</p>
                  <p className="text-slate-500 text-sm">{t("creationHint")}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
