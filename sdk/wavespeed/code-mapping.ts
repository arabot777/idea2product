import { CODE } from "@/lib/unibean/metric-code";
import {
  DiaTTSRequest,
  FluxControlLoraCannyRequest,
  FluxControlLoraDepthRequest,
  FluxDevFillRequest,
  FluxDevLoraTrainerRequest,
  FluxDevLoraUltraFastRequest,
  FluxDevLoraRequest,
  FluxDevUltraFastRequest,
  FluxDevRequest,
  FluxKontextMaxMultiRequest,
  FluxKontextMaxTextToImageRequest,
  FluxKontextMaxRequest,
  FluxKontextProMultiRequest,
  FluxKontextProTextToImageRequest,
  FluxKontextProRequest,
  FluxProReduxRequest,
  FluxReduxDevRequest,
  FluxSchnellLoraRequest,
  FluxSchnellRequest,
  FramepackRequest,
  GhibliRequest,
  HidreamE1FullRequest,
  HidreamI1DevRequest,
  HidreamI1FullRequest,
  HunyuanCustomRef2v480pRequest,
  HunyuanCustomRef2v720pRequest,
  HunyuanVideoI2vRequest,
  HunyuanVideoT2vRequest,
  Hunyuan3dV2MultiViewRequest,
  Imagen4Request,
  InstantCharacterRequest,
  KwaivgiKlingV16I2vProRequest,
  KwaivgiKlingV16I2vStandardRequest,
  KwaivgiKlingV16T2vStandardRequest,
  KwaivgiKlingV20I2vMasterRequest,
  KwaivgiKlingV20T2vMasterRequest,
  LtxVideoV097I2v480pRequest,
  LtxVideoV097I2v720pRequest,
  Magi124bRequest,
  MinimaxVideo01Request,
  MmaudioV2Request,
  NightmareaiRealEsrganRequest,
  RealEsrganRequest,
  SdxlLoraRequest,
  SdxlRequest,
  SkyReelsV1Request,
  Step1xEditRequest,
  UnoRequest,
  Veo2I2vRequest,
  Veo2T2vRequest,
  VideoUpscalerRequest,
  ViduImageToVideo20Request,
  ViduReferenceToVideo20Request,
  ViduStartEndToVideo20Request,
  Wan2114bVaceRequest,
  Wan21I2v480pLoraUltraFastRequest,
  Wan21I2v480pLoraRequest,
  Wan21I2v480pUltraFastRequest,
  Wan21I2v480pRequest,
  Wan21I2v720pLoraUltraFastRequest,
  Wan21I2v720pUltraFastRequest,
  Wan21I2v720pRequest,
  Wan21T2v480pLoraUltraFastRequest,
  Wan21T2v480pLoraRequest,
  Wan21T2v480pUltraFastRequest,
  Wan21T2v480pRequest,
  Wan21T2v720pLoraUltraFastRequest,
  Wan21T2v720pLoraRequest,
  Wan21T2v720pUltraFastRequest,
  Wan21V2v480pLoraUltraFastRequest,
  Wan21V2v480pLoraRequest,
  Wan21V2v480pUltraFastRequest,
  Wan21V2v480pRequest,
  Wan21V2v720pLoraUltraFastRequest,
  Wan21V2v720pLoraRequest,
  Wan21V2v720pUltraFastRequest,
  Wan21V2v720pRequest,
  Wan14bTrainerRequest,
  WanFlf2vRequest,
  WanTrainerRequest,
} from "@/sdk/wavespeed/requests";

export const getFeatureCalculator = (callCode: string) => {
  switch (callCode) {
    case CODE.DiaTts:
      return DiaTTSRequest.getFeatureCalculator();
    case CODE.FluxControlLoraCanny:
      return FluxControlLoraCannyRequest.getFeatureCalculator();
    case CODE.FluxControlLoraDepth:
      return FluxControlLoraDepthRequest.getFeatureCalculator();
    case CODE.FluxDevFill:
      return FluxDevFillRequest.getFeatureCalculator();
    case CODE.FluxDevLoraTrainer:
      return FluxDevLoraTrainerRequest.getFeatureCalculator();
    case CODE.FluxDevLoraUltraFast:
      return FluxDevLoraUltraFastRequest.getFeatureCalculator();
    case CODE.FluxDevLora:
      return FluxDevLoraRequest.getFeatureCalculator();
    case CODE.FluxDevUltraFast:
      return FluxDevUltraFastRequest.getFeatureCalculator();
    case CODE.FluxDev:
      return FluxDevRequest.getFeatureCalculator();
    case CODE.FluxKontextMaxMulti:
      return FluxKontextMaxMultiRequest.getFeatureCalculator();
    case CODE.FluxKontextMaxTextToImage:
      return FluxKontextMaxTextToImageRequest.getFeatureCalculator();
    case CODE.FluxKontextMax:
      return FluxKontextMaxRequest.getFeatureCalculator();
    case CODE.FluxKontextProMulti:
      return FluxKontextProMultiRequest.getFeatureCalculator();
    case CODE.FluxKontextProTextToImage:
      return FluxKontextProTextToImageRequest.getFeatureCalculator();
    case CODE.FluxKontextPro:
      return FluxKontextProRequest.getFeatureCalculator();
    case CODE.FluxProRedux:
      return FluxProReduxRequest.getFeatureCalculator();
    case CODE.FluxReduxDev:
      return FluxReduxDevRequest.getFeatureCalculator();
    case CODE.FluxSchnellLora:
      return FluxSchnellLoraRequest.getFeatureCalculator();
    case CODE.FluxSchnell:
      return FluxSchnellRequest.getFeatureCalculator();
    case CODE.Framepack:
      return FramepackRequest.getFeatureCalculator();
    case CODE.Ghibli:
      return GhibliRequest.getFeatureCalculator();
    case CODE.HidreamE1Full:
      return HidreamE1FullRequest.getFeatureCalculator();
    case CODE.HidreamI1Dev:
      return HidreamI1DevRequest.getFeatureCalculator();
    case CODE.HidreamI1Full:
      return HidreamI1FullRequest.getFeatureCalculator();
    case CODE.HunyuanCustomRef2v480p:
      return HunyuanCustomRef2v480pRequest.getFeatureCalculator();
    case CODE.HunyuanCustomRef2v720p:
      return HunyuanCustomRef2v720pRequest.getFeatureCalculator();
    case CODE.HunyuanVideoI2v:
      return HunyuanVideoI2vRequest.getFeatureCalculator();
    case CODE.HunyuanVideoT2v:
      return HunyuanVideoT2vRequest.getFeatureCalculator();
    case CODE.Hunyuan3dV2MultiView:
      return Hunyuan3dV2MultiViewRequest.getFeatureCalculator();
    case CODE.Imagen4:
      return Imagen4Request.getFeatureCalculator();
    case CODE.InstantCharacter:
      return InstantCharacterRequest.getFeatureCalculator();
    case CODE.KwaivgiKlingV16I2vPro:
      return KwaivgiKlingV16I2vProRequest.getFeatureCalculator();
    case CODE.KwaivgiKlingV16I2vStandard:
      return KwaivgiKlingV16I2vStandardRequest.getFeatureCalculator();
    case CODE.KwaivgiKlingV16T2vStandard:
      return KwaivgiKlingV16T2vStandardRequest.getFeatureCalculator();
    case CODE.KwaivgiKlingV20I2vMaster:
      return KwaivgiKlingV20I2vMasterRequest.getFeatureCalculator();
    case CODE.KwaivgiKlingV20T2vMaster:
      return KwaivgiKlingV20T2vMasterRequest.getFeatureCalculator();
    case CODE.LtxVideoV097I2v480p:
      return LtxVideoV097I2v480pRequest.getFeatureCalculator();
    case CODE.LtxVideoV097I2v720p:
      return LtxVideoV097I2v720pRequest.getFeatureCalculator();
    case CODE.Magi124b:
      return Magi124bRequest.getFeatureCalculator();
    case CODE.MinimaxVideo01:
      return MinimaxVideo01Request.getFeatureCalculator();
    case CODE.MmaudioV2:
      return MmaudioV2Request.getFeatureCalculator();
    case CODE.NightmareaiRealEsrgan:
      return NightmareaiRealEsrganRequest.getFeatureCalculator();
    case CODE.RealEsrgan:
      return RealEsrganRequest.getFeatureCalculator();
    case CODE.SdxlLora:
      return SdxlLoraRequest.getFeatureCalculator();
    case CODE.Sdxl:
      return SdxlRequest.getFeatureCalculator();
    case CODE.SkyReelsV1:
      return SkyReelsV1Request.getFeatureCalculator();
    case CODE.Step1xEdit:
      return Step1xEditRequest.getFeatureCalculator();
    case CODE.Uno:
      return UnoRequest.getFeatureCalculator();
    case CODE.Veo2I2v:
      return Veo2I2vRequest.getFeatureCalculator();
    case CODE.Veo2T2v:
      return Veo2T2vRequest.getFeatureCalculator();
    case CODE.VideoUpscaler:
      return VideoUpscalerRequest.getFeatureCalculator();
    case CODE.ViduImageToVideo20:
      return ViduImageToVideo20Request.getFeatureCalculator();
    case CODE.ViduReferenceToVideo20:
      return ViduReferenceToVideo20Request.getFeatureCalculator();
    case CODE.ViduStartEndToVideo20:
      return ViduStartEndToVideo20Request.getFeatureCalculator();
    case CODE.Wan2114bVace:
      return Wan2114bVaceRequest.getFeatureCalculator();
    case CODE.Wan21I2v480pLoraUltraFast:
      return Wan21I2v480pLoraUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21I2v480pLora:
      return Wan21I2v480pLoraRequest.getFeatureCalculator();
    case CODE.Wan21I2v480pUltraFast:
      return Wan21I2v480pUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21I2v480p:
      return Wan21I2v480pRequest.getFeatureCalculator();
    case CODE.Wan21I2v720pLoraUltraFast:
      return Wan21I2v720pLoraUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21I2v720pUltraFast:
      return Wan21I2v720pUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21I2v720p:
      return Wan21I2v720pRequest.getFeatureCalculator();
    case CODE.Wan21T2v480pLoraUltraFast:
      return Wan21T2v480pLoraUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21T2v480pLora:
      return Wan21T2v480pLoraRequest.getFeatureCalculator();
    case CODE.Wan21T2v480pUltraFast:
      return Wan21T2v480pUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21T2v480p:
      return Wan21T2v480pRequest.getFeatureCalculator();
    case CODE.Wan21T2v720pLoraUltraFast:
      return Wan21T2v720pLoraUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21T2v720pLora:
      return Wan21T2v720pLoraRequest.getFeatureCalculator();
    case CODE.Wan21T2v720pUltraFast:
      return Wan21T2v720pUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21V2v480pLoraUltraFast:
      return Wan21V2v480pLoraUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21V2v480pLora:
      return Wan21V2v480pLoraRequest.getFeatureCalculator();
    case CODE.Wan21V2v480pUltraFast:
      return Wan21V2v480pUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21V2v480p:
      return Wan21V2v480pRequest.getFeatureCalculator();
    case CODE.Wan21V2v720pLoraUltraFast:
      return Wan21V2v720pLoraUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21V2v720pLora:
      return Wan21V2v720pLoraRequest.getFeatureCalculator();
    case CODE.Wan21V2v720pUltraFast:
      return Wan21V2v720pUltraFastRequest.getFeatureCalculator();
    case CODE.Wan21V2v720p:
      return Wan21V2v720pRequest.getFeatureCalculator();
    case CODE.Wan14bTrainer:
      return Wan14bTrainerRequest.getFeatureCalculator();
    case CODE.WanFlf2v:
      return WanFlf2vRequest.getFeatureCalculator();
    case CODE.WanTrainer:
      return WanTrainerRequest.getFeatureCalculator();
    default:
      return {};
  }
};

export const getDefaultParams = (callCode: string) => {
  switch (callCode) {
    case CODE.DiaTts:
      return DiaTTSRequest.getDefaultParams();
    case CODE.FluxControlLoraCanny:
      return FluxControlLoraCannyRequest.getDefaultParams();
    case CODE.FluxControlLoraDepth:
      return FluxControlLoraDepthRequest.getDefaultParams();
    case CODE.FluxDevFill:
      return FluxDevFillRequest.getDefaultParams();
    case CODE.FluxDevLoraTrainer:
      return FluxDevLoraTrainerRequest.getDefaultParams();
    case CODE.FluxDevLoraUltraFast:
      return FluxDevLoraUltraFastRequest.getDefaultParams();
    case CODE.FluxDevLora:
      return FluxDevLoraRequest.getDefaultParams();
    case CODE.FluxDevUltraFast:
      return FluxDevUltraFastRequest.getDefaultParams();
    case CODE.FluxDev:
      return FluxDevRequest.getDefaultParams();
    case CODE.FluxKontextMaxMulti:
      return FluxKontextMaxMultiRequest.getDefaultParams();
    case CODE.FluxKontextMaxTextToImage:
      return FluxKontextMaxTextToImageRequest.getDefaultParams();
    case CODE.FluxKontextMax:
      return FluxKontextMaxRequest.getDefaultParams();
    case CODE.FluxKontextProMulti:
      return FluxKontextProMultiRequest.getDefaultParams();
    case CODE.FluxKontextProTextToImage:
      return FluxKontextProTextToImageRequest.getDefaultParams();
    case CODE.FluxKontextPro:
      return FluxKontextProRequest.getDefaultParams();
    case CODE.FluxProRedux:
      return FluxProReduxRequest.getDefaultParams();
    case CODE.FluxReduxDev:
      return FluxReduxDevRequest.getDefaultParams();
    case CODE.FluxSchnellLora:
      return FluxSchnellLoraRequest.getDefaultParams();
    case CODE.FluxSchnell:
      return FluxSchnellRequest.getDefaultParams();
    case CODE.Framepack:
      return FramepackRequest.getDefaultParams();
    case CODE.Ghibli:
      return GhibliRequest.getDefaultParams();
    case CODE.HidreamE1Full:
      return HidreamE1FullRequest.getDefaultParams();
    case CODE.HidreamI1Dev:
      return HidreamI1DevRequest.getDefaultParams();
    case CODE.HidreamI1Full:
      return HidreamI1FullRequest.getDefaultParams();
    case CODE.HunyuanCustomRef2v480p:
      return HunyuanCustomRef2v480pRequest.getDefaultParams();
    case CODE.HunyuanCustomRef2v720p:
      return HunyuanCustomRef2v720pRequest.getDefaultParams();
    case CODE.HunyuanVideoI2v:
      return HunyuanVideoI2vRequest.getDefaultParams();
    case CODE.HunyuanVideoT2v:
      return HunyuanVideoT2vRequest.getDefaultParams();
    case CODE.Hunyuan3dV2MultiView:
      return Hunyuan3dV2MultiViewRequest.getDefaultParams();
    case CODE.Imagen4:
      return Imagen4Request.getDefaultParams();
    case CODE.InstantCharacter:
      return InstantCharacterRequest.getDefaultParams();
    case CODE.KwaivgiKlingV16I2vPro:
      return KwaivgiKlingV16I2vProRequest.getDefaultParams();
    case CODE.KwaivgiKlingV16I2vStandard:
      return KwaivgiKlingV16I2vStandardRequest.getDefaultParams();
    case CODE.KwaivgiKlingV16T2vStandard:
      return KwaivgiKlingV16T2vStandardRequest.getDefaultParams();
    case CODE.KwaivgiKlingV20I2vMaster:
      return KwaivgiKlingV20I2vMasterRequest.getDefaultParams();
    case CODE.KwaivgiKlingV20T2vMaster:
      return KwaivgiKlingV20T2vMasterRequest.getDefaultParams();
    case CODE.LtxVideoV097I2v480p:
      return LtxVideoV097I2v480pRequest.getDefaultParams();
    case CODE.LtxVideoV097I2v720p:
      return LtxVideoV097I2v720pRequest.getDefaultParams();
    case CODE.Magi124b:
      return Magi124bRequest.getDefaultParams();
    case CODE.MinimaxVideo01:
      return MinimaxVideo01Request.getDefaultParams();
    case CODE.MmaudioV2:
      return MmaudioV2Request.getDefaultParams();
    case CODE.NightmareaiRealEsrgan:
      return NightmareaiRealEsrganRequest.getDefaultParams();
    case CODE.RealEsrgan:
      return RealEsrganRequest.getDefaultParams();
    case CODE.SdxlLora:
      return SdxlLoraRequest.getDefaultParams();
    case CODE.Sdxl:
      return SdxlRequest.getDefaultParams();
    case CODE.SkyReelsV1:
      return SkyReelsV1Request.getDefaultParams();
    case CODE.Step1xEdit:
      return Step1xEditRequest.getDefaultParams();
    case CODE.Uno:
      return UnoRequest.getDefaultParams();
    case CODE.Veo2I2v:
      return Veo2I2vRequest.getDefaultParams();
    case CODE.Veo2T2v:
      return Veo2T2vRequest.getDefaultParams();
    case CODE.VideoUpscaler:
      return VideoUpscalerRequest.getDefaultParams();
    case CODE.ViduImageToVideo20:
      return ViduImageToVideo20Request.getDefaultParams();
    case CODE.ViduReferenceToVideo20:
      return ViduReferenceToVideo20Request.getDefaultParams();
    case CODE.ViduStartEndToVideo20:
      return ViduStartEndToVideo20Request.getDefaultParams();
    case CODE.Wan2114bVace:
      return Wan2114bVaceRequest.getDefaultParams();
    case CODE.Wan21I2v480pLoraUltraFast:
      return Wan21I2v480pLoraUltraFastRequest.getDefaultParams();
    case CODE.Wan21I2v480pLora:
      return Wan21I2v480pLoraRequest.getDefaultParams();
    case CODE.Wan21I2v480pUltraFast:
      return Wan21I2v480pUltraFastRequest.getDefaultParams();
    case CODE.Wan21I2v480p:
      return Wan21I2v480pRequest.getDefaultParams();
    case CODE.Wan21I2v720pLoraUltraFast:
      return Wan21I2v720pLoraUltraFastRequest.getDefaultParams();
    case CODE.Wan21I2v720pUltraFast:
      return Wan21I2v720pUltraFastRequest.getDefaultParams();
    case CODE.Wan21I2v720p:
      return Wan21I2v720pRequest.getDefaultParams();
    case CODE.Wan21T2v480pLoraUltraFast:
      return Wan21T2v480pLoraUltraFastRequest.getDefaultParams();
    case CODE.Wan21T2v480pLora:
      return Wan21T2v480pLoraRequest.getDefaultParams();
    case CODE.Wan21T2v480pUltraFast:
      return Wan21T2v480pUltraFastRequest.getDefaultParams();
    case CODE.Wan21T2v480p:
      return Wan21T2v480pRequest.getDefaultParams();
    case CODE.Wan21T2v720pLoraUltraFast:
      return Wan21T2v720pLoraUltraFastRequest.getDefaultParams();
    case CODE.Wan21T2v720pLora:
      return Wan21T2v720pLoraRequest.getDefaultParams();
    case CODE.Wan21T2v720pUltraFast:
      return Wan21T2v720pUltraFastRequest.getDefaultParams();
    case CODE.Wan21V2v480pLoraUltraFast:
      return Wan21V2v480pLoraUltraFastRequest.getDefaultParams();
    case CODE.Wan21V2v480pLora:
      return Wan21V2v480pLoraRequest.getDefaultParams();
    case CODE.Wan21V2v480pUltraFast:
      return Wan21V2v480pUltraFastRequest.getDefaultParams();
    case CODE.Wan21V2v480p:
      return Wan21V2v480pRequest.getDefaultParams();
    case CODE.Wan21V2v720pLoraUltraFast:
      return Wan21V2v720pLoraUltraFastRequest.getDefaultParams();
    case CODE.Wan21V2v720pLora:
      return Wan21V2v720pLoraRequest.getDefaultParams();
    case CODE.Wan21V2v720pUltraFast:
      return Wan21V2v720pUltraFastRequest.getDefaultParams();
    case CODE.Wan21V2v720p:
      return Wan21V2v720pRequest.getDefaultParams();
    case CODE.Wan14bTrainer:
      return Wan14bTrainerRequest.getDefaultParams();
    case CODE.WanFlf2v:
      return WanFlf2vRequest.getDefaultParams();
    case CODE.WanTrainer:
      return WanTrainerRequest.getDefaultParams();
    default:
      return {};
  }
};
