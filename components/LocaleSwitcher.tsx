'use client';

import { useEffect, useState } from 'react';
import { LOCALE_STORAGE_KEY, DEFAULT_LOCALE, localeLabels, messages, getLocaleFromBrowser } from '@/locales';
import type { Locale } from '@/locales/types';

const localeOrder: Locale[] = ['zh', 'ja', 'en'];

export default function LocaleSwitcher() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const nextLocale = stored ? (stored as Locale) : getLocaleFromBrowser(navigator.languages?.[0]);
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale === 'zh' ? 'zh-CN' : nextLocale;
    document.title = messages[nextLocale].meta.title;
  }, []);

  const onLocaleChange = (nextLocale: Locale) => {
    setLocale(nextLocale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    document.documentElement.lang = nextLocale === 'zh' ? 'zh-CN' : nextLocale;
    document.title = messages[nextLocale].meta.title;
    window.dispatchEvent(new CustomEvent('pawmatch-locale-change', { detail: nextLocale }));
  };

  return (
    <div className="locale-switcher" aria-label={messages[locale].language.label}>
      {localeOrder.map((item) => (
        <button
          key={item}
          className={`locale-button ${locale === item ? 'active' : ''}`}
          onClick={() => onLocaleChange(item)}
          aria-pressed={locale === item}
        >
          {localeLabels[item]}
        </button>
      ))}
    </div>
  );
}
