import { CODE } from "@/lib/unibean/metric-code";
import * as Requests from "./requests";
import { BaseRequest } from "./base";  

function reviveInstanceByType(type: string) {
  const Clz = (Requests as Record<string, any>)[type];
  if (!Clz) {
    throw new Error(`Class ${type} not found`);
  }
  return new Clz();
}

function getClassTypeByCode(code: string): string {
  // Special cases that don't follow the standard pattern
  const specialCases: Record<string, string> = {
    [CODE.DiaTts]: "DiaTTSRequest",
    [CODE.FluxControlLoraCanny]: "FluxControlLoraCannyRequest",
    [CODE.FluxControlLoraDepth]: "FluxControlLoraDepthRequest",
    [CODE.FluxDevFill]: "FluxDevFillRequest",
    [CODE.FluxDevLora]: "FluxDevLoraRequest",
    [CODE.FluxDevLoraTrainer]: "FluxDevLoraTrainerRequest",
    [CODE.FluxDevLoraUltraFast]: "FluxDevLoraUltraFastRequest",
    [CODE.FluxDev]: "FluxDevRequest",
    [CODE.FluxDevUltraFast]: "FluxDevUltraFastRequest",
    [CODE.FluxKontextMaxMulti]: "FluxKontextMaxMultiRequest",
    [CODE.FluxKontextMax]: "FluxKontextMaxRequest",
    [CODE.FluxKontextMaxTextToImage]: "FluxKontextMaxTextToImageRequest",
    [CODE.FluxKontextProMulti]: "FluxKontextProMultiRequest",
    [CODE.FluxKontextPro]: "FluxKontextProRequest",
    [CODE.FluxKontextProTextToImage]: "FluxKontextProTextToImageRequest",
    [CODE.FluxProRedux]: "FluxProReduxRequest",
    [CODE.FluxReduxDev]: "FluxReduxDevRequest",
    [CODE.FluxSchnellLora]: "FluxSchnellLoraRequest",
    [CODE.FluxSchnell]: "FluxSchnellRequest",
    [CODE.Framepack]: "FramepackRequest",
    [CODE.Ghibli]: "GhibliRequest",
    [CODE.HidreamE1Full]: "HidreamE1FullRequest",
    [CODE.HidreamI1Dev]: "HidreamI1DevRequest",
    [CODE.HidreamI1Full]: "HidreamI1FullRequest",
    [CODE.Hunyuan3dV2MultiView]: "Hunyuan3dV2MultiViewRequest",
    [CODE.HunyuanCustomRef2v480p]: "HunyuanCustomRef2v480pRequest",
    [CODE.HunyuanCustomRef2v720p]: "HunyuanCustomRef2v720pRequest",
    [CODE.HunyuanVideoI2v]: "HunyuanVideoI2vRequest",
    [CODE.HunyuanVideoT2v]: "HunyuanVideoT2vRequest",
    [CODE.Imagen4]: "Imagen4Request",
    [CODE.InstantCharacter]: "InstantCharacterRequest",
    [CODE.KwaivgiKlingV16I2vPro]: "KwaivgiKlingV16I2vProRequest",
    [CODE.KwaivgiKlingV16I2vStandard]: "KwaivgiKlingV16I2vStandardRequest",
    [CODE.KwaivgiKlingV16T2vStandard]: "KwaivgiKlingV16T2vStandardRequest",
    [CODE.KwaivgiKlingV20I2vMaster]: "KwaivgiKlingV20I2vMasterRequest",
    [CODE.KwaivgiKlingV20T2vMaster]: "KwaivgiKlingV20T2vMasterRequest",
    [CODE.LtxVideoV097I2v480p]: "LtxVideoV097I2v480pRequest",
    [CODE.LtxVideoV097I2v720p]: "LtxVideoV097I2v720pRequest",
    [CODE.Magi124b]: "Magi124bRequest",
    [CODE.MinimaxVideo01]: "MinimaxVideo01Request",
    [CODE.MmaudioV2]: "MmaudioV2Request",
    [CODE.NightmareaiRealEsrgan]: "NightmareaiRealEsrganRequest",
    [CODE.RealEsrgan]: "RealEsrganRequest",
    [CODE.SdxlLora]: "SdxlLoraRequest",
    [CODE.Sdxl]: "SdxlRequest",
    [CODE.SkyReelsV1]: "SkyReelsV1Request",
    [CODE.Step1xEdit]: "Step1xEditRequest",
    [CODE.Uno]: "UnoRequest",
    [CODE.Veo2I2v]: "Veo2I2vRequest",
    [CODE.Veo2T2v]: "Veo2T2vRequest",
    [CODE.VideoUpscaler]: "VideoUpscalerRequest",
    [CODE.ViduImageToVideo20]: "ViduImageToVideo20Request",
    [CODE.ViduReferenceToVideo20]: "ViduReferenceToVideo20Request",
    [CODE.ViduStartEndToVideo20]: "ViduStartEndToVideo20Request",
    [CODE.Wan14bTrainer]: "Wan14bTrainerRequest",
    [CODE.Wan2114bVace]: "Wan2114bVaceRequest",
    [CODE.Wan21I2v480pLora]: "Wan21I2v480pLoraRequest",
    [CODE.Wan21I2v480pLoraUltraFast]: "Wan21I2v480pLoraUltraFastRequest",
    [CODE.Wan21I2v480p]: "Wan21I2v480pRequest",
    [CODE.Wan21I2v480pUltraFast]: "Wan21I2v480pUltraFastRequest",
    [CODE.Wan21I2v720pLoraUltraFast]: "Wan21I2v720pLoraUltraFastRequest",
    [CODE.Wan21I2v720p]: "Wan21I2v720pRequest",
    [CODE.Wan21I2v720pUltraFast]: "Wan21I2v720pUltraFastRequest",
    [CODE.Wan21T2v480pLora]: "Wan21T2v480pLoraRequest",
    [CODE.Wan21T2v480pLoraUltraFast]: "Wan21T2v480pLoraUltraFastRequest",
    [CODE.Wan21T2v480p]: "Wan21T2v480pRequest",
    [CODE.Wan21T2v480pUltraFast]: "Wan21T2v480pUltraFastRequest",
    [CODE.Wan21T2v720pLora]: "Wan21T2v720pLoraRequest",
    [CODE.Wan21T2v720pLoraUltraFast]: "Wan21T2v720pLoraUltraFastRequest",
    [CODE.Wan21T2v720pUltraFast]: "Wan21T2v720pUltraFastRequest",
    [CODE.Wan21V2v480pLora]: "Wan21V2v480pLoraRequest",
    [CODE.Wan21V2v480pLoraUltraFast]: "Wan21V2v480pLoraUltraFastRequest",
    [CODE.Wan21V2v480p]: "Wan21V2v480pRequest",
    [CODE.Wan21V2v480pUltraFast]: "Wan21V2v480pUltraFastRequest",
    [CODE.Wan21V2v720pLora]: "Wan21V2v720pLoraRequest",
    [CODE.Wan21V2v720pLoraUltraFast]: "Wan21V2v720pLoraUltraFastRequest",
    [CODE.Wan21V2v720p]: "Wan21V2v720pRequest",
    [CODE.Wan21V2v720pUltraFast]: "Wan21V2v720pUltraFastRequest",
    [CODE.WanFlf2v]: "WanFlf2vRequest",
    [CODE.WanTrainer]: "WanTrainerRequest",
  };

  // Return special case if exists
  if (specialCases[code]) {
    return specialCases[code];
  }
  throw new Error(`Call code ${code} not found`);
}

export const newRequest = (callCode: string) :BaseRequest<any>=> {
  const Clz = getClassTypeByCode(callCode);
  const instance = reviveInstanceByType(Clz);
  return instance;
};

export const getFeatureCalculator = (callCode: string): string => {
  const instance = newRequest(callCode);
  return instance.getFeatureCalculator();
};

export const getDefaultParams = (callCode: string): Record<string, any> => {
  const instance = newRequest(callCode);
  return instance.getDefaultParams();
};
