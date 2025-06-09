import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getCurrentUserProfile } from "@/app/actions/auth/get-user-info";
import { SWRConfig } from "swr";
import { getLocale, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
import { FontLoader } from "@/components/font-loader";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const user = await getCurrentUserProfile();
  return (
    <html lang={locale} className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className} overflow-y-scroll`}>
      <body className="min-h-[100dvh] bg-gray-50">
        <FontLoader className={manrope.className} />
        <Toaster richColors position="top-center" />
        <SWRConfig
          value={{
            fallback: {
              "current-user": user,
              "locale": locale,
            },
          }}>
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
