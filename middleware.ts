import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { updateSessionAndAuth } from "./lib/supabase/middleware";

const locales = ["en", "zh-CN"];
const defaultLocale = "en";

// 使用具名导出而不是默认导出
export async function middleware(request: NextRequest) {
  try {
    // 简化国际化处理
    const intlMiddleware = createIntlMiddleware({
      locales,
      defaultLocale,
      localePrefix: "as-needed",
      localeDetection: false,
    });
    
    const intlResponse = intlMiddleware(request);
    
    // 处理认证
    const authResponse = await updateSessionAndAuth(request);
    
    // 合并响应
    if (authResponse && authResponse.status !== 200) {
      return authResponse;
    }
    
    return intlResponse || NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$).*)'
  ],
};