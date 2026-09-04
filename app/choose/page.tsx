'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, messages, getLocaleFromBrowser } from '@/locales';
import type { Locale } from '@/locales/types';
import styles from './choose.module.css';

export default function ChoosePage() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    setLocale(stored ? (stored as Locale) : getLocaleFromBrowser(navigator.languages?.[0]));
    const listener = (event: Event) => setLocale((event as CustomEvent<Locale>).detail ?? DEFAULT_LOCALE);
    window.addEventListener('pawmatch-locale-change', listener);
    return () => window.removeEventListener('pawmatch-locale-change', listener);
  }, []);

  const t = messages[locale];
  return (
    <main className={`page-shell ${styles.pageShell}`}>
      <section className={`hero-card home-card ${styles.chooseCard}`}>
        <header className={styles.header}>
          <div className={styles.brandMark} aria-label="PawMatch">PawMatch <span>•</span></div>
          <LocaleSwitcher />
        </header>
        <div className={styles.intro}>
          <span className="eyebrow">PawMatch</span>
          <h1 className="home-title">{t.entry.title}</h1>
          <p className="home-desc">{t.entry.description}</p>
        </div>
        <div className={styles.choiceGrid}>
          <Link href="/quiz?type=suitable" className={`${styles.choiceCard} ${styles.suitableCard}`}>
            <div className={styles.imageFrame}>
              <img src="/breeds/Golden Retriever.jpg" alt="" className={styles.dogImage} />
              <span className={styles.cardKicker}>PawMatch / 01</span>
            </div>
            <div className={styles.cardContent}>
              <h2>{t.entry.suitableTitle}</h2>
              <p>{t.entry.suitableDescription}</p>
              <span className={styles.cardAction}>{t.entry.suitableStart}<span aria-hidden="true">→</span></span>
            </div>
          </Link>
          <Link href="/quiz?type=personality" className={`${styles.choiceCard} ${styles.personalityCard}`}>
            <div className={styles.imageFrame}>
              <img src="/breeds/Siberian Husky.jpg" alt="" className={styles.dogImage} />
              <span className={styles.cardKicker}>PawMatch / 02</span>
            </div>
            <div className={styles.cardContent}>
              <h2>{t.entry.personalityTitle}</h2>
              <p>{t.entry.personalityDescription}</p>
              <span className={styles.cardAction}>{t.entry.personalityStart}<span aria-hidden="true">→</span></span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}