export type Locale = 'zh' | 'ja' | 'en';

export type QuestionId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10';
export type OptionId = 'A' | 'B' | 'C' | 'D';

export interface PawMatchMessages {
  meta: {
    title: string;
    description: string;
  };
  language: {
    label: string;
    zh: string;
    ja: string;
    en: string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    start: string;
    meta: string;
  };
  quiz: {
    previous: string;
    next: string;
    reveal: string;
    progress: string;
    home: string;
  };
  result: {
    revealTitle: string;
    secondaryPrefix: string;
    cuteFlawLabel: string;
    saveImage: string;
    share: string;
    email: string;
    copy: string;
    copied: string;
    retry: string;
    loading: string;
    privacy: string;
    entertainment: string;
  };
  notices: {
    entertainment: string;
    privacy: string;
    imageFallback: string;
    attachmentHint: string;
  };
  questions: Record<QuestionId, {
    text: string;
    options: Record<OptionId, string>;
  }>;
  breeds: Record<string, {
    name: string;
    tags: [string, string, string];
    summary: string;
    flaw: string;
    share: string;
  }>;
}
