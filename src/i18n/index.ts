import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

export const supportedLanguages = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'ru', name: 'Русский', short: 'RU' },
  { code: 'uz', name: "O'zbek", short: 'UZ' },
] as const;

export type SupportedLocale = (typeof supportedLanguages)[number]['code'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uz: { translation: uz },
    },
    lng: 'uz',
    fallbackLng: 'uz',
    supportedLngs: ['en', 'ru', 'uz'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
