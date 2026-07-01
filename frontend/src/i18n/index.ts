import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LOCALES = ['es-CL', 'es-MX', 'en-US'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const STORAGE_KEY = 'wms_locale';

export function getStoredLocale(): AppLocale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.includes(stored as AppLocale)) {
    return stored as AppLocale;
  }
  const browser = navigator.language.replace('_', '-');
  if (SUPPORTED_LOCALES.includes(browser as AppLocale)) return browser as AppLocale;
  if (browser.startsWith('en')) return 'en-US';
  if (browser.startsWith('es')) return 'es-CL';
  return 'es-CL';
}

export function persistLocale(locale: AppLocale): void {
  localStorage.setItem(STORAGE_KEY, locale);
}

const localeLoaders: Record<AppLocale, () => Promise<[Record<string, unknown>, Record<string, unknown>]>> = {
  'es-CL': async () => {
    const [common, inventario] = await Promise.all([
      import('./locales/es-CL/common.json'),
      import('./locales/es-CL/inventario.json'),
    ]);
    return [common.default, inventario.default];
  },
  'es-MX': async () => {
    const [common, inventario] = await Promise.all([
      import('./locales/es-MX/common.json'),
      import('./locales/es-MX/inventario.json'),
    ]);
    return [common.default, inventario.default];
  },
  'en-US': async () => {
    const [common, inventario] = await Promise.all([
      import('./locales/en-US/common.json'),
      import('./locales/en-US/inventario.json'),
    ]);
    return [common.default, inventario.default];
  },
};

export async function loadLocale(locale: AppLocale): Promise<void> {
  if (i18n.hasResourceBundle(locale, 'common')) {
    await i18n.changeLanguage(locale);
    return;
  }
  const [common, inventario] = await localeLoaders[locale]();
  i18n.addResourceBundle(locale, 'common', common, true, true);
  i18n.addResourceBundle(locale, 'inventario', inventario, true, true);
  await i18n.changeLanguage(locale);
}

void i18n.use(initReactI18next).init({
  lng: getStoredLocale(),
  fallbackLng: 'es-CL',
  supportedLngs: [...SUPPORTED_LOCALES],
  ns: ['common', 'inventario'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  resources: {},
});

export { useTranslation } from 'react-i18next';
export default i18n;
