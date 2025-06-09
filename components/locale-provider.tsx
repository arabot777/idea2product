"use client";
import { NextIntlClientProvider } from "next-intl";
import useSWR from "swr";
import { ReactNode } from "react";

interface LocaleProviderProps {
  children: ReactNode;
  messages: any;
  locale?: string;
  timeZone?: string;
  now?: Date;
}

export default function LocaleProvider({ children, messages, locale, timeZone, now }: LocaleProviderProps) {
  // Prioritize props.locale, fallback to SWR if not available
  const swr = useSWR("locale");
  const currentLocale = locale ?? swr.data ?? "en";
  return (
    <NextIntlClientProvider 
      locale={currentLocale} 
      messages={messages}
      timeZone={timeZone}
      now={now}
    >
      {children}
    </NextIntlClientProvider>
  );
}
