import {getRequestConfig} from 'next-intl/server';
import {ReactNode} from 'react';
import React from 'react';

interface RequestConfig {
  locale: string;
  messages: Record<string, any>;
  timeZone: string;
  now: Date;
  defaultTranslationValues: {
    strong: (chunks: ReactNode) => ReactNode;
    em: (chunks: ReactNode) => ReactNode;
  };
}

export default getRequestConfig(async ({locale}) => {
  const resolvedLocale = locale || 'en';
  return {
    locale: resolvedLocale,
    messages: (await import(`./i18n/${resolvedLocale}.json`)).default,
    timeZone: 'UTC',
    now: new Date(),
    defaultTranslationValues: {
      strong: (chunks: ReactNode) => React.createElement('strong', {}, chunks),
      em: (chunks: ReactNode) => React.createElement('em', {}, chunks),
    },
  } as RequestConfig;
});
