'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { quizQuestions } from '@/data/quiz.v1';
import { suitableQuestions } from '@/data/suitableQuiz.v1';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, messages, getLocaleFromBrowser } from '@/locales';
import type { Locale } from '@/locales/types';
import type { QuizType } from '@/types/personality';

const PERSONALITY_STORAGE_KEY = 'pawmatch:personality:v1';
const SUITABLE_STORAGE_KEY = 'pawmatch:suitable:v1';

export default function QuizPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [quizType, setQuizType] = useState<QuizType>('personality');

  const questions = quizType === 'suitable' ? suitableQuestions : quizQuestions;
  const storageKey = quizType === 'suitable' ? SUITABLE_STORAGE_KEY : PERSONALITY_STORAGE_KEY;

  useEffect(() => {
    const nextType = new URLSearchParams(window.location.search).get('type') === 'suitable' ? 'suitable' : 'personality';
    setQuizType(nextType);
    const stored = window.sessionStorage.getItem(nextType === 'suitable' ? SUITABLE_STORAGE_KEY : PERSONALITY_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.answers && parsed?.index !== undefined) {
          setAnswers(parsed.answers);
          const savedIndex = Number(parsed.index);
          setIndex(Number.isInteger(savedIndex) ? Math.max(0, Math.min(savedIndex, (nextType === 'suitable' ? suitableQuestions : quizQuestions).length - 1)) : 0);
        }
      } catch {
        window.sessionStorage.removeItem(nextType === 'suitable' ? SUITABLE_STORAGE_KEY : PERSONALITY_STORAGE_KEY);
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
    window.sessionStorage.setItem(storageKey, JSON.stringify({ index, answers }));
  }, [index, answers, storageKey]);

  const current = questions[Math.max(0, Math.min(index, questions.length - 1))] ?? questions[0];
  const progress = useMemo(() => Math.round(((index + 1) / questions.length) * 100), [index, questions.length]);
  const t = messages[locale];
  const currentQuestionId = current.id as keyof typeof t.questions & keyof typeof t.suitableQuestions;
  const translatedQuestion = quizType === 'suitable' ? t.suitableQuestions[currentQuestionId as keyof typeof t.suitableQuestions] : t.questions[currentQuestionId as keyof typeof t.questions];

  const selectOption = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }));
    if (index < questions.length - 1) {
      window.setTimeout(() => setIndex((prev) => prev + 1), 250);
    }
  };

  const onNext = () => {
    if (index < questions.length - 1) setIndex((prev) => prev + 1);
    else router.push(`/result?type=${quizType}`);
  };

  const onPrev = () => {
    if (index > 0) setIndex((prev) => prev - 1);
  };

  return (
    <main className="page-shell">
      <section className="quiz-card">
        <div className="topbar">
          <Link href="/choose" className="ghost-link">← {t.quiz.home}</Link>
          <LocaleSwitcher />
          <div className="progress-wrap">
            <span>{t.quiz.progress.replace('{current}', String(index + 1)).replace('{total}', String(questions.length))}</span>
            <div className="progress-bar"><div style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        <div className="question-block">
          <h2 className="question-title">{translatedQuestion.text}</h2>
          <div className="option-list">
            {current.options.map((option) => {
              const selected = answers[current.id] === option.id;
              return (
                <button key={option.id} className={`option ${selected ? 'selected' : ''}`} onClick={() => selectOption(option.id)}>
                  <span>{option.id}</span>
                  <span>{translatedQuestion.options[option.id as keyof typeof translatedQuestion.options]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="actions">
          <button className="secondary" onClick={onPrev} disabled={index === 0}>{t.quiz.previous}</button>
          <button className="primary" onClick={onNext} disabled={!answers[current.id]}>{index === questions.length - 1 ? t.quiz.reveal : t.quiz.next}</button>
        </div>
      </section>
    </main>
  );
}
