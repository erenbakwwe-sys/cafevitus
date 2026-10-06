import { en } from './en';
import { da } from './da';
import { tr } from './tr';
import { Language } from '../types';

export type TranslationKeys = typeof en;

export const translations: Record<Language, TranslationKeys> = {
  en,
  da: da as unknown as TranslationKeys,
  tr: tr as unknown as TranslationKeys,
};
