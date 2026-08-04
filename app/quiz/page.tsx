'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { quizQuestions } from '@/data/quiz.v1';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, messages, getLocaleFromBrowser } from '@/locales';
import type { Locale } from '@/locales/types';

const STORAGE_KEY = 'pawmatch-quiz-v1';

export default function QuizPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.answers && parsed?.index !== undefined) {
          setAnswers(parsed.answers);
          setIndex(parsed.index);
        }
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
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

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ index, answers }));
  }, [index, answers]);

  const current = quizQuestions[index];
  const progress = useMemo(() => Math.round(((index + 1) / quizQuestions.length) * 100), [index]);
  const t = messages[locale];
  const currentQuestionId = current.id as keyof typeof t.questions;
  const questionText = t.questions[currentQuestionId].text;
  const questionOptions = t.questions[currentQuestionId].options;

  const selectOption = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
    if (index < quizQuestions.length - 1) {
      window.setTimeout(() => setIndex((prev) => prev + 1), 250);
    }
  };

  const onNext = () => {
    if (index < quizQuestions.length - 1) setIndex((prev) => prev + 1);
    else router.push('/result');
  };

  const onPrev = () => {
    if (index > 0) setIndex((prev) => prev - 1);
  };

  return (
    <main className="page-shell">
      <section className="quiz-card">
        <div className="topbar">
          <Link href="/" className="ghost-link">← {t.quiz.home}</Link>
          <LocaleSwitcher />
          <div className="progress-wrap">
            <span>{t.quiz.progress.replace('{current}', String(index + 1)).replace('{total}', String(quizQuestions.length))}</span>
            <div className="progress-bar"><div style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        <div className="question-block">
          <h2 className="question-title">{questionText}</h2>
          <div className="option-list">
            {current.options.map((option) => {
              const selected = answers[current.id] === option.id;
              return (
                <button key={option.id} className={`option ${selected ? 'selected' : ''}`} onClick={() => selectOption(option.id)}>
                  <span>{option.id}</span>
                  <span>{questionOptions[option.id as keyof typeof questionOptions]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="actions">
          <button className="secondary" onClick={onPrev} disabled={index === 0}>{t.quiz.previous}</button>
          <button className="primary" onClick={onNext} disabled={!answers[current.id]}>{index === quizQuestions.length - 1 ? t.quiz.reveal : t.quiz.next}</button>
        </div>
      </section>
    </main>
  );
}
