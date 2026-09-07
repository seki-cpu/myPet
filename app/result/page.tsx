'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { computeResult } from '@/domain/scoring';
import { computeSuitableResultV2 } from '@/domain/suitableScoring.v2';
import { getBreedById } from '@/domain/scoring';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, messages, getLocaleFromBrowser } from '@/locales';
import type { Locale } from '@/locales/types';
import type { QuizType } from '@/types/personality';

const PERSONALITY_STORAGE_KEY = 'pawmatch:personality:v1';
const SUITABLE_STORAGE_KEY = 'pawmatch:suitable:v1';

type ResultState = {
  primaryBreed: ReturnType<typeof getBreedById>;
  secondaryBreed: ReturnType<typeof getBreedById>;
  rankedBreeds?: Array<{ breedId: string; score: number }>;
  keywords?: string[];
};

export default function ResultPage() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [message, setMessage] = useState('');
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [quizType, setQuizType] = useState<QuizType>('personality');
  const [isMobile, setIsMobile] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

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
        const outcome = computeSuitableResultV2(parsed.answers ?? {});
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
        setResult({
          primaryBreed: outcome.primaryBreed,
          secondaryBreed: outcome.secondaryBreed,
          keywords: outcome.keywords,
        });
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
  const resultUrl = useMemo(() => {
    const path = `/result?type=${quizType}&breed=${primary?.id ?? 'golden-retriever'}&second=${secondary?.id ?? 'poodle'}&v=1`;
    return typeof window === 'undefined' ? path : new URL(path, window.location.origin).toString();
  }, [primary, secondary, quizType]);

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
    window.location.href = '/choose';
  };

  const shareSocial = async (platform: 'wechat' | 'instagram' | 'whatsapp' | 'line' | 'copy') => {
    const breedName = messages[locale].breeds[primary?.id ?? '']?.name ?? primary?.name ?? '';
    const revealTitle = quizType === 'suitable' ? t.result.suitableRevealTitle : t.result.revealTitle;
    const shareText = `${revealTitle} ${breedName} ${resultUrl}`;
    try {
      await navigator.clipboard?.writeText(shareText);
      if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
      } else if (platform === 'line') {
        window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
      } else if (platform === 'instagram') {
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      }
      setMessage(t.result.copied);
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
          {quizType === 'suitable' && result.rankedBreeds && <div className="small-note">{t.result.topMatches}：{result.rankedBreeds.map((match: { breedId: string; score: number }) => `${messages[locale].breeds[match.breedId]?.name ?? match.breedId} ${match.score}%`).join(' · ')}</div>}
          {quizType === 'personality' && result.keywords && <div className="small-note">{t.result.personalityKeywords}：{result.keywords.map((key: string) => t.result.personalityTraitLabels[key] ?? key).join(' · ')}</div>}
          {quizType === 'suitable' && <p className="small-note">{t.result.suitabilityDisclaimer}</p>}
        </div>

        <div className="action-group">
          <button className="primary" onClick={downloadImage}>{t.result.saveImage}</button>
          <button className="ghost" onClick={resetQuiz}>{t.result.retry}</button>
        </div>

        {isMobile && (
          <section className="share-panel" aria-label={t.result.socialTitle}>
            <button
              className="primary share-toggle"
              type="button"
              aria-expanded={isShareMenuOpen}
              aria-controls="mobile-share-options"
              onClick={() => setIsShareMenuOpen((isOpen) => !isOpen)}
            >
              <span aria-hidden="true">↗</span>
              {t.result.share}
              <span className={`share-chevron ${isShareMenuOpen ? 'open' : ''}`} aria-hidden="true">⌄</span>
            </button>

            {isShareMenuOpen && (
              <div id="mobile-share-options" className="share-drawer">
                <div className="share-drawer-title">{t.result.socialTitle}</div>
                <div className="share-scroll" role="list">
                  <button className="share-app" type="button" role="listitem" onClick={downloadImage}>
                    <span className="share-app-icon share-app-image" aria-hidden="true">↓</span>
                    <span>{t.result.saveImage}</span>
                  </button>
                  <button className="share-app" type="button" role="listitem" onClick={() => shareSocial('copy')}>
                    <span className="share-app-icon share-app-copy" aria-hidden="true">↗</span>
                    <span>{t.result.copyLink}</span>
                  </button>
                  <button className="share-app" type="button" role="listitem" onClick={() => shareSocial('wechat')}>
                    <span className="share-app-icon share-app-wechat" aria-hidden="true">微</span>
                    <span>{t.result.wechat}</span>
                  </button>
                  <button className="share-app" type="button" role="listitem" onClick={() => shareSocial('instagram')}>
                    <span className="share-app-icon share-app-instagram" aria-hidden="true">◎</span>
                    <span>{t.result.instagram}</span>
                  </button>
                  <button className="share-app" type="button" role="listitem" onClick={() => shareSocial('whatsapp')}>
                    <span className="share-app-icon share-app-whatsapp" aria-hidden="true">☎</span>
                    <span>{t.result.whatsapp}</span>
                  </button>
                  <button className="share-app" type="button" role="listitem" onClick={() => shareSocial('line')}>
                    <span className="share-app-icon share-app-line" aria-hidden="true">L</span>
                    <span>{t.result.line}</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <div className="small-note">{message || t.notices.entertainment}</div>
        <Link href="/about" className="about-link">{t.result.privacy}</Link>
      </section>
    </main>
  );
}
