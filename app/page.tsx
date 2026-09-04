'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, localeLabels, messages, getLocaleFromBrowser } from '@/locales';
import type { Locale } from '@/locales/types';

const localeOrder: Locale[] = ['zh', 'ja', 'en'];

export default function HomePage() {
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

  const t = messages[locale];

  return (
    <main className="page-shell">
      <section className="hero-card home-card locale-landing">
        <span className="eyebrow">{t.home.eyebrow}</span>
        <h1 className="home-title">{t.language.label}</h1>
        <p className="home-desc">{t.home.description}</p>

        <div className="locale-grid">
          {localeOrder.map((item) => (
            <button
              key={item}
              type="button"
              className={`locale-option ${locale === item ? 'active' : ''}`}
              onClick={() => onLocaleChange(item)}
              aria-pressed={locale === item}
            >
              <span className="locale-option-name">{localeLabels[item]}</span>
              <span className="locale-option-sub">{item === 'zh' ? '简体中文' : item === 'ja' ? '日本語' : 'English'}</span>
            </button>
          ))}
        </div>

        <div className="meta-line">{t.home.meta}</div>
        <Link href="/choose" className="cta-button">{t.home.start}</Link>
      </section>
    </main>
  );
}
