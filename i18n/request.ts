import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale = 'en' }) => ({
  locale: locale as string,
  messages: (await import(`./${locale}.json`)).default
}));