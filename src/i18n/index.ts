import { en } from './en';
import { da } from './da';
import { Language } from '../types';

export type TranslationKeys = typeof en;

export const translations: Record<Language, TranslationKeys> = {
  en,
  da: da as unknown as TranslationKeys,
};

