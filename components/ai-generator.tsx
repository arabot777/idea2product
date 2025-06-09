"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Loader2, Download, Share2, Wand2, Upload, Sparkles } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

export default function AIGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [textPrompt, setTextPrompt] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const t = useTranslations('AIGenerator'); // Assuming an 'AIGenerator' namespace for translations

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI generation process
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setGeneratedImage("/placeholder.svg?height=512&width=512")
    setIsGenerating(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      {/* Control Panel */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white">{t('controlPanelTitle')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="text-to-image" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 p-1">
              <TabsTrigger
                value="text-to-image"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('textToImageTab')}
              </TabsTrigger>
              <TabsTrigger
                value="image-to-image"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t('imageToImageTab')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text-to-image" className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label htmlFor="prompt" className="text-slate-200 font-medium">
                  {t('textToImagePromptLabel')}
                </Label>
                <Textarea
                  id="prompt"
                  placeholder={t('textToImagePlaceholder')}
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="min-h-[120px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="image-to-image" className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label htmlFor="image-upload" className="text-slate-200 font-medium">
                  {t('imageToImageUploadLabel')}
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
                      alt={t('uploadedImageAlt')}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover mx-auto shadow-lg"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="modify-prompt" className="text-slate-200 font-medium">
                  {t('imageToImageModifyPromptLabel')}
                </Label>
                <Textarea
                  id="modify-prompt"
                  placeholder={t('imageToImageModifyPromptPlaceholder')}
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
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                {t('generatingText')}
              </>
            ) : (
              <>
                <Wand2 className="mr-3 h-5 w-5" />
                {t('startGeneratingButton')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Display */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl text-white">{t('resultTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-slate-700/30 rounded-xl flex items-center justify-center overflow-hidden">
            {isGenerating ? (
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                  <div
                    className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">{t('generatingStatus')}</p>
                  <p className="text-slate-400 text-sm">{t('generatingHint')}</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="w-full space-y-4">
                <div className="relative group">
                  <Image
                    src={generatedImage || "/placeholder.svg"}
                    alt={t('generatedImageAlt')}
                    width={512}
                    height={512}
                    className="w-full h-full object-cover rounded-lg shadow-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                    <div className="flex space-x-3">
                      <Button size="sm" variant="secondary" className="bg-white/90 text-slate-900 hover:bg-white">
                        <Download className="w-4 h-4 mr-2" />
                        {t('downloadButton')}
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white/90 text-slate-900 hover:bg-white">
                        <Share2 className="w-4 h-4 mr-2" />
                        {t('shareButton')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-600/50 rounded-full flex items-center justify-center mx-auto">
                  <Wand2 className="w-10 h-10 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-300 font-medium">{t('waitingForCreation')}</p>
                  <p className="text-slate-500 text-sm">{t('creationHint')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}