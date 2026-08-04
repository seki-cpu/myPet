'use client';

import { useEffect, useState } from 'react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, messages, getLocaleFromBrowser } from '@/locales';
import type { Locale } from '@/locales/types';

export default function AboutPage() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const nextLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      ? (window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale)
      : getLocaleFromBrowser(navigator.languages?.[0]);
    setLocale(nextLocale);
  }, []);

  useEffect(() => {
    const listener = (event: Event) => {
      const nextLocale = (event as CustomEvent<Locale>).detail ?? DEFAULT_LOCALE;
      setLocale(nextLocale);
    };
    window.addEventListener('pawmatch-locale-change', listener);
    return () => window.removeEventListener('pawmatch-locale-change', listener);
  }, []);

  const t = messages[locale];

  return (
    <main className="page-shell">
      <section className="about-card">
        <LocaleSwitcher />
        <h1 className="about-title">{locale === 'zh' ? '说明' : locale === 'ja' ? '説明' : 'About'}</h1>
        <p className="about-copy">{t.notices.entertainment}</p>
        <p className="about-copy">{t.notices.privacy}</p>
        <p className="about-copy">Version: v0.1</p>
      </section>
    </main>
  );
}
