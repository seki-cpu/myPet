import { enMessages } from '@/locales/en';
import { jaMessages } from '@/locales/ja';
import { zhMessages } from '@/locales/zh';
import type { Locale } from '@/locales/types';

export const messages = {
  zh: zhMessages,
  ja: jaMessages,
  en: enMessages,
} as const;

export const getLocaleFromBrowser = (lang?: string | null): Locale => {
  if (!lang) return 'zh';
  const normalized = lang.toLowerCase();
  if (normalized.startsWith('ja')) return 'ja';
  if (normalized.startsWith('en')) return 'en';
  if (normalized.startsWith('zh')) return 'zh';
  return 'zh';
};

export const localeLabels: Record<Locale, string> = {
  zh: '中文',
  ja: '日本語',
  en: 'English',
};

export const DEFAULT_LOCALE: Locale = 'zh';
export const LOCALE_STORAGE_KEY = 'pawmatch-locale';
