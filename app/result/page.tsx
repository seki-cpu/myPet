'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { computeResult } from '@/domain/scoring';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, messages, getLocaleFromBrowser } from '@/locales';
import type { Locale } from '@/locales/types';

const STORAGE_KEY = 'pawmatch-quiz-v1';

export default function ResultPage() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      window.location.href = '/';
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      const outcome = computeResult(parsed.answers ?? {});
      if (outcome.status === 'incomplete') {
        window.location.href = '/quiz';
        return;
      }
      setResult(outcome);
    } catch {
      window.location.href = '/';
    }

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
  const primary = result?.primaryBreed;
  const secondary = result?.secondaryBreed;
  const resultUrl = useMemo(() => `https://pawmatch.example/result?breed=${primary?.id ?? 'golden-retriever'}&second=${secondary?.id ?? 'poodle'}&v=1`, [primary, secondary]);

  const downloadImage = async () => {
    if (!cardRef.current || !primary) return;
    const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `pawmatch-${primary.id}.png`;
    link.click();
    setMessage(t.notices.attachmentHint);
  };

  const resetQuiz = () => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = '/quiz';
  };

  if (!result || !primary || !secondary) {
    return <main className="page-shell"><div className="hero-card">{t.result.loading}</div></main>;
  }

  return (
    <main className="page-shell">
      <section className="result-card">
        <LocaleSwitcher />
        <div className="result-preview" ref={cardRef}>
          <div className="badge">PawMatch</div>
          <h1 className="result-title">{t.result.revealTitle}</h1>
          <div className="dog-badge">{messages[locale].breeds[primary.id]?.name ?? primary.name}</div>
          <div className="dog-illustration">
            <img src={primary.imagePath} alt={messages[locale].breeds[primary.id]?.name ?? primary.name} />
          </div>
          <div className="tags">{messages[locale].breeds[primary.id]?.tags.map((tag: string) => <span key={tag}>{tag}</span>)}</div>
          <p className="summary">{messages[locale].breeds[primary.id]?.summary ?? primary.summary}</p>
          <div className="flaw">{t.result.cuteFlawLabel}：{messages[locale].breeds[primary.id]?.flaw ?? primary.cuteFlaw}</div>
          <div className="secondary">{t.result.secondaryPrefix.replace('{breed}', messages[locale].breeds[secondary.id]?.name ?? secondary.name)}</div>
        </div>

        <div className="action-group single-action">
          <button className="primary" onClick={downloadImage}>{t.result.saveImage}</button>
          <button className="ghost" onClick={resetQuiz}>{t.result.retry}</button>
        </div>

        <div className="small-note">{message || t.notices.entertainment}</div>
        <Link href="/about" className="about-link">{t.result.privacy}</Link>
      </section>
    </main>
  );
}
