'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Zap, Mail, Globe } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';

export default function Footer() {
  const t = useTranslations("HomePage.footer");

  const footerSections = [
    {
      title: t('aiTools.title'),
      links: [
        { name: t('aiTools.idPhoto'), href: '/id-photo' },
        // { name: t('aiTools.photoRepair'), href: '/photo-repair' },
        // { name: t('aiTools.qualityEnhance'), href: '/quality-enhance' },
        // { name: t('aiTools.textEnhance'), href: '/text-enhance' },
        // { name: t('aiTools.pngEnhance'), href: '/png-enhance' },
        // { name: t('aiTools.colorize'), href: '/colorize' },
        // { name: t('aiTools.animeRestore'), href: '/anime-restore' }
      ]
    },
    // {
    //   title: t('aiEcommerce.title'),
    //   links: [
    //     { name: t('aiEcommerce.cutout'), href: '/ai-cutout' },
    //     { name: t('aiEcommerce.eraser'), href: '/eraser' },
    //     { name: t('aiEcommerce.logo'), href: '/ai-logo' },
    //     { name: t('aiEcommerce.poster'), href: '/ai-poster' },
    //     { name: t('aiEcommerce.inpainting'), href: '/inpainting' },
    //     { name: t('aiEcommerce.backgroundCompose'), href: '/background-compose' }
    //   ]
    // },
    // {
    //   title: t('otherTools.title'),
    //   links: [
    //     { name: t('otherTools.scratchRemoval'), href: '/scratch-removal' },
    //     { name: t('otherTools.sharpen'), href: '/sharpen' },
    //     { name: t('otherTools.avatarCutout'), href: '/avatar-cutout' },
    //     { name: t('otherTools.aiDrawing'), href: '/ai-drawing' },
    //     { name: t('otherTools.aiPortrait'), href: '/ai-portrait' },
    //     { name: t('otherTools.aiFilter'), href: '/ai-filter' },
    //     { name: t('otherTools.compress'), href: '/compress' },
    //     { name: t('otherTools.formatConvert'), href: '/format-convert' },
    //     { name: t('otherTools.deblur'), href: '/deblur' }
    //   ]
    // },
    // {
    //   title: t('api.title'),
    //   links: [
    //     { name: t('api.aiImage'), href: '/api/ai-image' },
    //     { name: t('api.aiVideo'), href: '/api/ai-video' }
    //   ]
    // },
    {
      title: t('support.title'),
      links: [
        // { name: t('support.qa'), href: '/qa' },
        { name: t('support.about'), href: '/about' },
        { name: t('support.terms'), href: '/terms' },
        { name: t('support.userAgreement'), href: '/user-agreement' },
        { name: t('support.privacy'), href: '/privacy' },
        { name: t('support.cookie'), href: '/cookie-policy' }
      ]
    }
  ];

  return (
    <footer className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 group mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{t('company')}</span>
            </Link>
            
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{t('email')}</span>
              </div>
              <Link href="/renewal" className="block hover:text-white transition-colors">
                {t('renewal')}
              </Link>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold text-white text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </Link>
            <p className="text-sm text-slate-400">
              {t('copyright')}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Globe className="w-4 h-4" />
              <span>{t('language')}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
} 