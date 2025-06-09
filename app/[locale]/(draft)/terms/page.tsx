import React from 'react';
import { useTranslations } from 'next-intl';

export default function TermsOfServicePage() {
  const t = useTranslations('DraftTermsPage');
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6 text-center">{t('title')}</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('section1_title')}</h2>
        <p className="mb-2">{t('section1_content')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('section2_title')}</h2>
        <p className="mb-2">{t('section2_content')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('section3_title')}</h2>
        <p className="mb-2">{t('section3_content1')}</p>
        <p className="mb-2">{t('section3_content2')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('section4_title')}</h2>
        <p className="mb-2">{t('section4_content1')}</p>
        <p className="mb-2">{t('section4_content2')}</p>
        <ul className="list-disc list-inside ml-4">
          <li>{t('section4_list_item1')}</li>
          <li>{t('section4_list_item2')}</li>
          <li>{t('section4_list_item3')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('section5_title')}</h2>
        <p className="mb-2">{t('section5_content1')}</p>
        <p className="mb-2">{t('section5_content2')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('section6_title')}</h2>
        <p className="mb-2">{t('section6_content1')}</p>
        <p className="mb-2">{t('section6_content2')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('section7_title')}</h2>
        <p className="mb-2">{t('section7_content')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('section8_title')}</h2>
        <p className="mb-2">{t('section8_content')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('section9_title')}</h2>
        <p className="mb-2">{t('section9_content')}</p>
      </section>

      <p className="text-sm text-gray-500 mt-8 text-center">{t('last_updated')}</p>
    </div>
  );
}