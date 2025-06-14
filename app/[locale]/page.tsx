'use client';

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Scissors, Download, CheckCircle, Star, ChevronRight, Camera, Palette, Shield, Clock, ArrowRight, Sparkles, Zap, Users, Award, Target, TrendingUp, Globe, CheckCircle2, Play, Pause, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile } from "@/app/actions/auth/get-user-info";
import { useState, useEffect } from "react";
import Image from "next/image";
import Footer from "@/components/footer";

export default function HomePage() {
  const t = useTranslations("HomePage");

  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isCategoryAutoPlaying, setIsCategoryAutoPlaying] = useState(true);

  // 轮播展示的真实证件照图片
  const showcaseImages = [
    {
      original: "https://d2p7pge43lyniu.cloudfront.net/output/d99dd33b-2da8-4d85-94c8-56c203559b5e-u2_068b63af-cf1b-44ae-8272-c4b261b27219.jpeg",
      type: t("idTypes.oneInch.name"),
      size: "25×35mm",
      description: t("idTypes.oneInch.description"),
      gradient: "from-blue-400 to-blue-600"
    },
    {
      original: "https://d2p7pge43lyniu.cloudfront.net/output/d99dd33b-2da8-4d85-94c8-56c203559b5e-u2_068b63af-cf1b-44ae-8272-c4b261b27219.jpeg",
      type: t("idTypes.twoInch.name"), 
      size: "35×49mm",
      description: t("idTypes.twoInch.description"),
      gradient: "from-red-400 to-red-600"
    },
    {
      original: "https://d2p7pge43lyniu.cloudfront.net/output/d99dd33b-2da8-4d85-94c8-56c203559b5e-u2_068b63af-cf1b-44ae-8272-c4b261b27219.jpeg",
      type: t("idTypes.smallTwoInch.name"),
      size: "35×45mm", 
      description: t("idTypes.smallTwoInch.description"),
      gradient: "from-green-400 to-green-600"
    },
    {
      original: "https://d2p7pge43lyniu.cloudfront.net/output/d99dd33b-2da8-4d85-94c8-56c203559b5e-u2_068b63af-cf1b-44ae-8272-c4b261b27219.jpeg",
      type: t("idTypes.bigOneInch.name"),
      size: "33×48mm",
      description: t("idTypes.bigOneInch.description"), 
      gradient: "from-purple-400 to-purple-600"
    },
  ];

  // 证件照类型轮播数据
  const idPhotoCategories = [
    { 
      name: t("categories.classic.name"), 
      description: t("categories.classic.description"),
      icon: "🪪",
      color: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50/80 to-blue-100/80",
      image: "https://d2p7pge43lyniu.cloudfront.net/output/d99dd33b-2da8-4d85-94c8-56c203559b5e-u2_068b63af-cf1b-44ae-8272-c4b261b27219.jpeg"
    },
    { 
      name: t("categories.academic.name"), 
      description: t("categories.academic.description"),
      icon: "🎓",
      color: "from-green-500 to-green-600",
      bgGradient: "from-green-50/80 to-green-100/80",
      image: "https://d2p7pge43lyniu.cloudfront.net/output/d99dd33b-2da8-4d85-94c8-56c203559b5e-u2_068b63af-cf1b-44ae-8272-c4b261b27219.jpeg"
    },
    { 
      name: t("categories.professional.name"), 
      description: t("categories.professional.description"),
      icon: "💼",
      color: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50/80 to-purple-100/80",
      image: "https://d2p7pge43lyniu.cloudfront.net/output/d99dd33b-2da8-4d85-94c8-56c203559b5e-u2_068b63af-cf1b-44ae-8272-c4b261b27219.jpeg"
    },
    { 
      name: t("categories.marriage.name"), 
      description: t("categories.marriage.description"),
      icon: "💍",
      color: "from-red-500 to-red-600",
      bgGradient: "from-red-50/80 to-red-100/80",
      image: "https://d2p7pge43lyniu.cloudfront.net/output/d99dd33b-2da8-4d85-94c8-56c203559b5e-u2_068b63af-cf1b-44ae-8272-c4b261b27219.jpeg"
    },
    { 
      name: t("categories.family.name"), 
      description: t("categories.family.description"),
      icon: "👨‍👩‍👧",
      color: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50/80 to-amber-100/80",
      image: "https://d2p7pge43lyniu.cloudfront.net/output/d99dd33b-2da8-4d85-94c8-56c203559b5e-u2_068b63af-cf1b-44ae-8272-c4b261b27219.jpeg"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, showcaseImages.length]);

  useEffect(() => {
    if (!isCategoryAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % idPhotoCategories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isCategoryAutoPlaying, idPhotoCategories.length]);
  
  const startButtonHandler = async () => {
    try {
      const userInfo = await getCurrentUserProfile();
      if (userInfo?.id) {
        router.push('/id-photo');
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error(t("common.error"));
    }
  };

  const nextCategory = () => {
    setCurrentCategoryIndex((prev) => (prev + 1) % idPhotoCategories.length);
  };

  const prevCategory = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + idPhotoCategories.length) % idPhotoCategories.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 backdrop-blur-sm">
      {/* Glass overlay for entire page */}
      <div className="fixed inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none z-0"></div>
      
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section with Enhanced Glass Effect */}
        <section className="pt-24 pb-16 relative overflow-hidden">
          {/* Enhanced Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Content */}
              <div className="lg:w-1/2 space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-6 py-3 bg-white/60 backdrop-blur-md border border-white/40 text-blue-700 rounded-full text-sm font-medium shadow-xl">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("hero.badge")}
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {t("hero.title.smart")}
                    </span>
                    <br />
                    <span className="text-gray-900">{t("hero.title.generate")}</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {t("hero.description")}
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">
                      {t("hero.features")}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={startButtonHandler}
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-xl hover:shadow-2xl transition-all duration-300 text-lg group backdrop-blur-sm">
                    <Camera className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t("hero.startButton")}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 bg-white/40 backdrop-blur-md border-white/50 text-gray-700 hover:bg-white/60 transition-all duration-300 text-lg shadow-lg">
                    {t("hero.viewExamples")}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                {/* Enhanced Stats with Glass Effect */}
                <div className="flex gap-8 pt-4">
                  {[
                    { value: "100万+", label: t("stats.users"), icon: Users },
                    { value: "50+", label: t("stats.formats"), icon: Target },
                    { value: "3秒", label: t("stats.speed"), icon: Zap }
                  ].map((stat, index) => (
                    <div key={index} className="text-center group">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-2 shadow-lg backdrop-blur-sm">
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                          {stat.value}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content - Enhanced Image Carousel */}
              <div className="lg:w-1/2 flex justify-center">
                <div className="relative">
                  {/* Main Showcase Card with Enhanced Glass Effect */}
                  <div className="relative w-96 h-[500px] bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10"></div>
                    
                    {/* Current Image Display */}
                    <div className="p-8 h-full flex flex-col justify-center items-center relative z-10">
                      <div className="relative w-48 h-60 rounded-2xl overflow-hidden shadow-2xl mb-6 group">
                        <Image
                          src={showcaseImages[currentImageIndex].original}
                          alt={showcaseImages[currentImageIndex].type}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${showcaseImages[currentImageIndex].gradient} opacity-20`}></div>
                      </div>
                      
                      <div className="text-center space-y-2 bg-white/40 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                        <div className="font-bold text-xl text-gray-800">
                          {showcaseImages[currentImageIndex].type}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {showcaseImages[currentImageIndex].size}
                        </div>
                        <div className="text-xs text-gray-500">
                          {showcaseImages[currentImageIndex].description}
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center gap-4 mt-6">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                          className="bg-white/40 backdrop-blur-md hover:bg-white/60 shadow-lg"
                        >
                          {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="flex gap-2">
                          {showcaseImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentImageIndex 
                                  ? 'bg-blue-600 w-6 shadow-lg' 
                                  : 'bg-white/60 hover:bg-white/80 backdrop-blur-sm'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium animate-bounce shadow-xl backdrop-blur-sm">
                    ✨ {t("features.highQuality")}
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-xl backdrop-blur-sm">
                    🤖 {t("features.aiSmart")}
                  </div>
                  <div className="absolute top-1/2 -left-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-xl backdrop-blur-sm">
                    {t("features.instantPreview")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 证件照类型轮播 - 美图风格 */}
        <section className="py-16 bg-white/30 backdrop-blur-md">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("categories.title")}</h2>
              <p className="text-gray-600">{t("categories.subtitle")}</p>
            </div>

            {/* 轮播容器 */}
            <div className="relative max-w-6xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-2xl">
                <div className="flex transition-transform duration-500 ease-in-out" 
                     style={{ transform: `translateX(-${currentCategoryIndex * 100}%)` }}>
                  {idPhotoCategories.map((category, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <div className="flex flex-col lg:flex-row items-center p-8 lg:p-12 gap-8">
                        {/* 左侧图片 */}
                        <div className="lg:w-1/2 flex justify-center">
                          <div className="relative w-80 h-96 rounded-2xl overflow-hidden shadow-2xl group">
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-20`}></div>
                            <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl shadow-lg`}>
                                  {category.icon}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">{category.name}</div>
                                  <div className="text-sm text-gray-600">{t("categories.professional")}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 右侧内容 */}
                        <div className="lg:w-1/2 space-y-6">
                          <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${category.bgGradient} backdrop-blur-sm rounded-full text-sm font-medium shadow-lg`}>
                            <span className="text-2xl mr-2">{category.icon}</span>
                            {category.name}
                          </div>
                          
                          <h3 className="text-3xl font-bold text-gray-900">
                            {category.name}
                          </h3>
                          
                          <p className="text-lg text-gray-600 leading-relaxed">
                            {category.description}
                          </p>

                          <div className="space-y-3">
                            {[
                              t("features.aiCutout"),
                              t("features.multipleBackgrounds"), 
                              t("features.standardSize"),
                              t("features.instantGeneration")
                            ].map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={startButtonHandler}
                            size="lg"
                            className={`h-12 px-8 bg-gradient-to-r ${category.color} hover:shadow-xl transition-all duration-300 text-white font-medium group`}
                          >
                            <Camera className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                            {t("common.startNow")}
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 导航按钮 */}
                <button
                  onClick={prevCategory}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/60 backdrop-blur-md hover:bg-white/80 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform" />
                </button>
                
                <button
                  onClick={nextCategory}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/60 backdrop-blur-md hover:bg-white/80 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform" />
                </button>

                {/* 指示器 */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {idPhotoCategories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCategoryIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentCategoryIndex 
                          ? 'bg-white w-8 shadow-lg' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                {/* 播放控制 */}
                <div className="absolute top-6 right-6">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsCategoryAutoPlaying(!isCategoryAutoPlaying)}
                    className="bg-white/40 backdrop-blur-md hover:bg-white/60 shadow-lg"
                  >
                    {isCategoryAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 制作步骤 - Enhanced Glass */}
        <section className="py-16 bg-gradient-to-r from-gray-50/60 to-slate-50/60 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("steps.title")}</h2>
              <p className="text-gray-600">{t("steps.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Upload,
                  title: t("steps.upload.title"),
                  description: t("steps.upload.description"),
                  color: "from-blue-500 to-blue-600",
                  bgColor: "from-blue-50/80 to-blue-100/80"
                },
                {
                  icon: Scissors,
                  title: t("steps.process.title"),
                  description: t("steps.process.description"),
                  color: "from-green-500 to-green-600",
                  bgColor: "from-green-50/80 to-green-100/80"
                },
                {
                  icon: Download,
                  title: t("steps.download.title"),
                  description: t("steps.download.description"),
                  color: "from-purple-500 to-purple-600",
                  bgColor: "from-purple-50/80 to-purple-100/80"
                }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-24 h-24 bg-gradient-to-br ${step.bgColor} backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-xl border border-white/40`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 产品特色 - Enhanced Glass */}
        <section className="py-16 bg-white/40 backdrop-blur-md">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("features.title")}</h2>
              <p className="text-gray-600">{t("features.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Camera,
                  title: t("features.smartCutout"),
                  description: t("features.smartCutoutDesc"),
                  color: "from-blue-500 to-blue-600",
                  bgColor: "from-blue-50/80 to-blue-100/80"
                },
                {
                  icon: Palette,
                  title: t("features.multipleColors"),
                  description: t("features.multipleColorsDesc"),
                  color: "from-green-500 to-green-600",
                  bgColor: "from-green-50/80 to-green-100/80"
                },
                {
                  icon: Shield,
                  title: t("features.privacy"),
                  description: t("features.privacyDesc"),
                  color: "from-purple-500 to-purple-600",
                  bgColor: "from-purple-50/80 to-purple-100/80"
                },
                {
                  icon: Clock,
                  title: t("features.fastGeneration"),
                  description: t("features.fastGenerationDesc"),
                  color: "from-yellow-500 to-yellow-600",
                  bgColor: "from-yellow-50/80 to-yellow-100/80"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.bgColor} backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-xl border border-white/40`}>
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 产品介绍 - Enhanced Glass */}
        <section className="py-16 bg-gradient-to-br from-slate-50/60 to-gray-50/60 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("products.title")}</h2>
              <p className="text-gray-600">{t("products.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  href: "/ai-avatar",
                  icon: "🧙‍♂️",
                  title: t("products.avatar.title"),
                  description: t("products.avatar.description"),
                  color: "from-blue-500 to-blue-600",
                  hoverColor: "hover:border-blue-300"
                },
                {
                  href: "/ai-background",
                  icon: "🖼️", 
                  title: t("products.background.title"),
                  description: t("products.background.description"),
                  color: "from-purple-500 to-purple-600",
                  hoverColor: "hover:border-purple-300"
                },
                {
                  href: "/ai-enhance",
                  icon: "✨",
                  title: t("products.enhance.title"), 
                  description: t("products.enhance.description"),
                  color: "from-green-500 to-green-600",
                  hoverColor: "hover:border-green-300"
                }
              ].map((product, index) => (
                <Link key={index} href={product.href} className="group">
                  <Card className={`h-full hover:shadow-2xl transition-all duration-300 border-white/50 bg-white/30 backdrop-blur-xl overflow-hidden group-hover:-translate-y-2 ${product.hoverColor}`}>
                    <div className={`h-1 bg-gradient-to-r ${product.color} w-full`}></div>
                    <CardContent className="p-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/60 to-gray-50/60 backdrop-blur-md flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl border border-white/40">
                        {product.icon}
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{product.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-8 bg-white/40 backdrop-blur-md border-white/50 text-gray-700 hover:bg-white/60 transition-all duration-300 group shadow-xl"
                asChild
              >
                <Link href="/products">
                  {t("products.viewAll")}
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 用户评价与数据统计 - Enhanced Glass */}
        <section className="py-16 bg-white/30 backdrop-blur-md">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("testimonials.title")}</h2>
              <p className="text-gray-600">{t("testimonials.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[
                { 
                  icon: Users, 
                  value: "1,000,000+", 
                  label: t("stats.totalUsers"),
                  color: "from-blue-500 to-blue-600",
                  bgColor: "from-blue-50/80 to-blue-100/80"
                },
                { 
                  icon: Award, 
                  value: "4.9/5.0", 
                  label: t("stats.rating"),
                  color: "from-yellow-500 to-yellow-600",
                  bgColor: "from-yellow-50/80 to-yellow-100/80"
                },
                { 
                  icon: TrendingUp, 
                  value: "99.8%", 
                  label: t("stats.successRate"),
                  color: "from-green-500 to-green-600",
                  bgColor: "from-green-50/80 to-green-100/80"
                },
                { 
                  icon: Globe, 
                  value: "50+", 
                  label: t("stats.countries"),
                  color: "from-purple-500 to-purple-600",
                  bgColor: "from-purple-50/80 to-purple-100/80"
                }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 bg-gradient-to-br ${stat.bgColor} backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-xl border border-white/40`}>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* 用户评价 */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  avatar: "👨‍💼",
                  name: t("testimonials.user1.name"),
                  role: t("testimonials.user1.role"),
                  comment: t("testimonials.user1.comment"),
                  rating: 5
                },
                {
                  avatar: "👩‍🎓", 
                  name: t("testimonials.user2.name"),
                  role: t("testimonials.user2.role"),
                  comment: t("testimonials.user2.comment"),
                  rating: 5
                },
                {
                  avatar: "👩‍💻",
                  name: t("testimonials.user3.name"), 
                  role: t("testimonials.user3.role"),
                  comment: t("testimonials.user3.comment"),
                  rating: 5
                }
              ].map((review, index) => (
                <Card key={index} className="bg-white/40 backdrop-blur-xl border-white/50 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl mr-4 shadow-lg">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{review.name}</div>
                        <div className="text-sm text-gray-600">{review.role}</div>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 常见问题 - Enhanced Glass */}
        <section className="py-16 bg-gradient-to-br from-gray-50/60 to-slate-50/60 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("faq.title")}</h2>
              <p className="text-gray-600">{t("faq.subtitle")}</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  question: t("faq.q1.question"),
                  answer: t("faq.q1.answer")
                },
                {
                  question: t("faq.q2.question"),
                  answer: t("faq.q2.answer")
                },
                {
                  question: t("faq.q3.question"),
                  answer: t("faq.q3.answer")
                },
                {
                  question: t("faq.q4.question"),
                  answer: t("faq.q4.answer")
                }
              ].map((faq, index) => (
                <Card key={index} className="bg-white/40 backdrop-blur-xl border-white/50 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                        <span className="text-white font-bold text-sm">Q</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 最终CTA - Enhanced Glass */}
        <section className="py-16 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="container mx-auto px-6 relative">
            <div className="text-center text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                {t("cta.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={startButtonHandler}
                  size="lg"
                  className="h-14 px-8 bg-white/90 backdrop-blur-md text-blue-600 hover:bg-white font-medium shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg group">
                  <Camera className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {t("cta.startButton")}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 border-white/40 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 text-lg shadow-xl">
                  {t("cta.learnMore")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
