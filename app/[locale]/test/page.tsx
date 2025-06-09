import { useTranslations } from 'next-intl';

export default function TestPage() {
  const t = useTranslations('TestPage');
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p>{t('description')}</p>
      <div className="mt-4">
        <a href="/" className="text-blue-600 hover:underline">{t('backToHome')}</a>
      </div>
      <div className="mt-2">
        <a href="/login" className="text-blue-600 hover:underline">{t('loginPage')}</a>
      </div>
    </div>
  );
}