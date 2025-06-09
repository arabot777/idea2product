import React from 'react';
import { useTranslations } from 'next-intl';

export default function PrivacyPolicyPage() {
  const t = useTranslations('DraftPrivacyPage');
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6 text-center">{t('privacyPolicy')}</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('introductionTitle')}</h2>
        <p className="mb-2">{t('introductionText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('informationWeCollectTitle')}</h2>
        <p className="mb-2">{t('informationWeCollectText')}</p>
        <ul className="list-disc list-inside ml-4">
          <li>{t('personalIdentificationInfo')}</li>
          <li>{t('usageData')}</li>
          <li>{t('technicalData')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('howWeUseYourInformationTitle')}</h2>
        <p className="mb-2">{t('howWeUseYourInformationText')}</p>
        <ul className="list-disc list-inside ml-4">
          <li>{t('provideMaintainImproveServices')}</li>
          <li>{t('processTransactions')}</li>
          <li>{t('communicateWithYou')}</li>
          <li>{t('monitorAnalyzeTrends')}</li>
          <li>{t('detectInvestigatePrevent')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('sharingYourInformationTitle')}</h2>
        <p className="mb-2">{t('sharingYourInformationText')}</p>
        <ul className="list-disc list-inside ml-4">
          <li>{t('serviceProviders')}</li>
          <li>{t('legalRequest')}</li>
          <li>{t('protectOurPremium')}</li>
          <li>{t('mergerAcquisition')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('dataSecurityTitle')}</h2>
        <p className="mb-2">{t('dataSecurityText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('yourChoicesTitle')}</h2>
        <p className="mb-2">{t('yourChoicesText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('childrensPrivacyTitle')}</h2>
        <p className="mb-2">{t('childrensPrivacyText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('internationalDataTransfersTitle')}</h2>
        <p className="mb-2">{t('internationalDataTransfersText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('yourPremiumTitle')}</h2>
        <p className="mb-2">{t('yourPremiumText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('changesToPrivacyPolicyTitle')}</h2>
        <p className="mb-2">{t('changesToPrivacyPolicyText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('contactUsTitle')}</h2>
        <p className="mb-2">{t('contactUsText')}</p>
      </section>

      <p className="text-sm text-gray-500 mt-8 text-center">{t('lastUpdated')}</p>
    </div>
  );
}