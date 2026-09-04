'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { computeResult } from '@/domain/scoring';
import { computeSuitableResult } from '@/domain/suitableScoring';
import { getBreedById } from '@/domain/scoring';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, messages, getLocaleFromBrowser } from '@/locales';
import type { Locale } from '@/locales/types';
import type { QuizType } from '@/types/personality';

const PERSONALITY_STORAGE_KEY = 'pawmatch:personality:v1';
const SUITABLE_STORAGE_KEY = 'pawmatch:suitable:v1';

export default function ResultPage() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [quizType, setQuizType] = useState<QuizType>('personality');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const nextType: QuizType = new URLSearchParams(window.location.search).get('type') === 'suitable' ? 'suitable' : 'personality';
    setQuizType(nextType);
    const storageKey = nextType === 'suitable' ? SUITABLE_STORAGE_KEY : PERSONALITY_STORAGE_KEY;
    const stored = window.sessionStorage.getItem(storageKey);
    if (!stored) {
      window.location.href = '/';
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (nextType === 'suitable') {
        const outcome = computeSuitableResult(parsed.answers ?? {});
        if (outcome.status === 'incomplete') {
          window.location.href = `/quiz?type=${nextType}`;
          return;
        }
        setResult({ ...outcome, primaryBreed: getBreedById(outcome.primaryBreedId), secondaryBreed: getBreedById(outcome.secondaryBreedId) });
      } else {
        const outcome = computeResult(parsed.answers ?? {});
        if (outcome.status === 'incomplete') {
          window.location.href = `/quiz?type=${nextType}`;
          return;
        }
        setResult(outcome);
      }
    } catch {
      window.location.href = '/';
    }

    const nextLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      ? (window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale)
      : getLocaleFromBrowser(navigator.languages?.[0]);
    setLocale(nextLocale);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 700px)');
    const updateViewport = () => setIsMobile(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
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
  const resultUrl = useMemo(() => `https://pawmatch.example/result?type=${quizType}&breed=${primary?.id ?? 'golden-retriever'}&second=${secondary?.id ?? 'poodle'}&v=1`, [primary, secondary, quizType]);

  const downloadImage = async () => {
    if (!cardRef.current || !primary) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `pawmatch-${primary.id}.png`;
      link.click();
      setMessage(t.notices.attachmentHint);
    } catch {
      setMessage(t.notices.imageFallback);
    }
  };

  const resetQuiz = () => {
    window.sessionStorage.removeItem(quizType === 'suitable' ? SUITABLE_STORAGE_KEY : PERSONALITY_STORAGE_KEY);
    window.location.href = `/quiz?type=${quizType}`;
  };

  const shareResult = async () => {
    const breedName = messages[locale].breeds[primary?.id ?? '']?.name ?? primary?.name ?? '';
    const text = quizType === 'suitable' ? t.result.suitableRevealTitle : t.result.revealTitle;
    if (navigator.share) await navigator.share({ title: 'PawMatch', text: `${text} ${breedName}`, url: resultUrl });
    else await navigator.clipboard?.writeText(`${text} ${breedName} ${resultUrl}`);
    setMessage(t.result.copied);
  };

  const shareSocial = async (platform: 'wechat' | 'instagram' | 'whatsapp' | 'line' | 'copy') => {
    const breedName = messages[locale].breeds[primary?.id ?? '']?.name ?? primary?.name ?? '';
    const shareText = `${t.result.suitableRevealTitle} ${breedName} ${resultUrl}`;
    try {
      await navigator.clipboard?.writeText(shareText);
      if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
      } else if (platform === 'line') {
        window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
      } else if (platform === 'instagram') {
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      }
      setMessage(platform === 'copy' || platform === 'wechat' || platform === 'instagram' ? t.result.copied : t.result.copied);
    } catch {
      setMessage(t.notices.imageFallback);
    }
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
          <h1 className="result-title">{quizType === 'suitable' ? t.result.suitableRevealTitle : t.result.revealTitle}</h1>
          <div className="dog-badge">{messages[locale].breeds[primary.id]?.name ?? primary.name}</div>
          <div className="dog-illustration">
            <img src={primary.imagePath} alt={messages[locale].breeds[primary.id]?.name ?? primary.name} />
          </div>
          <div className="tags">{(quizType === 'suitable' ? t.suitableTags[primary.id] : messages[locale].breeds[primary.id]?.tags).map((tag: string) => <span key={tag}>{tag}</span>)}</div>
          <p className="summary">{quizType === 'suitable' ? t.result.suitableWhy.replace('{breed}', messages[locale].breeds[primary.id]?.name ?? primary.name) : messages[locale].breeds[primary.id]?.summary ?? primary.summary}</p>
          <div className="flaw">{quizType === 'suitable' ? `${t.result.considerationsLabel}：${t.result.suitableConsideration} ${t.result.healthNotice} ${t.suitableCautions[primary.id]}` : `${t.result.cuteFlawLabel}：${messages[locale].breeds[primary.id]?.flaw ?? primary.cuteFlaw}`}</div>
          <div className="secondary">{(quizType === 'suitable' ? t.result.suitableSecondaryPrefix : t.result.secondaryPrefix).replace('{breed}', messages[locale].breeds[secondary.id]?.name ?? secondary.name)}</div>
          {quizType === 'suitable' && <p className="small-note">{t.result.suitabilityDisclaimer}</p>}
        </div>

        <div className="action-group">
          <button className="primary" onClick={downloadImage}>{t.result.saveImage}</button>
          <button className="ghost" onClick={resetQuiz}>{t.result.retry}</button>
        </div>

        {isMobile && (
          <div className="action-group single-action">
            <button className="primary" onClick={shareResult}>{t.result.share}</button>
          </div>
        )}

        {quizType === 'suitable' && isMobile && (
          <div className="action-group" aria-label={t.result.socialTitle}>
            <div className="small-note">{t.result.socialTitle}</div>
            <button className="primary" onClick={shareResult}>{t.result.share}</button>
            <button className="secondary" onClick={() => shareSocial('copy')}>{t.result.copyLink}</button>
            <button className="secondary" onClick={() => shareSocial('wechat')}>{t.result.wechat}</button>
            <button className="secondary" onClick={() => shareSocial('instagram')}>{t.result.instagram}</button>
            <button className="secondary" onClick={() => shareSocial('whatsapp')}>{t.result.whatsapp}</button>
            <button className="secondary" onClick={() => shareSocial('line')}>{t.result.line}</button>
          </div>
        )}

        <div className="small-note">{message || t.notices.entertainment}</div>
        <Link href="/about" className="about-link">{t.result.privacy}</Link>
      </section>
    </main>
  );
}
