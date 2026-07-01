import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getStoredLocale,
  loadLocale,
  persistLocale,
  type AppLocale,
  SUPPORTED_LOCALES,
} from '@/i18n';
import { setLocaleHeadersProvider } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import type { PreferenciasLocale } from '@/types/api';

const TIMEZONE_KEY = 'wms_timezone';
const CURRENCY_KEY = 'wms_currency';

const TIMEZONE_PRESETS: Record<string, string> = {
  'es-CL': 'America/Santiago',
  'es-MX': 'America/Mexico_City',
  'en-US': 'America/New_York',
};

const CURRENCY_PRESETS: Record<string, string> = {
  'es-CL': 'CLP',
  'es-MX': 'MXN',
  'en-US': 'USD',
};

export interface LocaleSettings {
  locale: AppLocale;
  timezone: string;
  currency: string;
}

interface LocaleContextValue extends LocaleSettings {
  supportedLocales: readonly AppLocale[];
  ready: boolean;
  setLocale: (locale: AppLocale) => Promise<void>;
  setTimezone: (tz: string) => void;
  setCurrency: (code: string) => void;
  formatDate: (value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/Santiago';
  }
}

function getStoredTimezone(): string {
  return localStorage.getItem(TIMEZONE_KEY) ?? detectTimezone();
}

function getStoredCurrency(locale: AppLocale): string {
  return localStorage.getItem(CURRENCY_KEY) ?? CURRENCY_PRESETS[locale] ?? 'CLP';
}

function normalizeAppLocale(value: string): AppLocale {
  if (SUPPORTED_LOCALES.includes(value as AppLocale)) return value as AppLocale;
  if (value.startsWith('en')) return 'en-US';
  if (value.includes('MX')) return 'es-MX';
  return 'es-CL';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, sessionKey } = useAuth();
  const initialLocale = getStoredLocale();
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [timezone, setTimezoneState] = useState(getStoredTimezone);
  const [currency, setCurrencyState] = useState(() => getStoredCurrency(initialLocale));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLocale(locale).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    setLocaleHeadersProvider(() => ({
      'Accept-Language': locale,
      'X-Time-Zone': timezone,
      'X-Currency': currency,
    }));
  }, [locale, timezone, currency]);

  const applySessionLocale = useCallback(async (prefs: PreferenciasLocale) => {
    const nextLocale = normalizeAppLocale(prefs.locale);
    persistLocale(nextLocale);
    localStorage.setItem(TIMEZONE_KEY, prefs.timezone);
    localStorage.setItem(CURRENCY_KEY, prefs.currency.toUpperCase());
    setLocaleState(nextLocale);
    setTimezoneState(prefs.timezone);
    setCurrencyState(prefs.currency.toUpperCase());
    await loadLocale(nextLocale);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.preferencias_locale || sessionKey === 0) return;
    void applySessionLocale(user.preferencias_locale);
  }, [sessionKey, isAuthenticated, user?.preferencias_locale, applySessionLocale]);

  const setLocale = useCallback(async (next: AppLocale) => {
    persistLocale(next);
    setLocaleState(next);
    if (!localStorage.getItem(TIMEZONE_KEY)) {
      setTimezoneState(TIMEZONE_PRESETS[next] ?? detectTimezone());
    }
    if (!localStorage.getItem(CURRENCY_KEY)) {
      setCurrencyState(CURRENCY_PRESETS[next] ?? 'CLP');
    }
  }, []);

  const setTimezone = useCallback((tz: string) => {
    localStorage.setItem(TIMEZONE_KEY, tz);
    setTimezoneState(tz);
  }, []);

  const setCurrency = useCallback((code: string) => {
    localStorage.setItem(CURRENCY_KEY, code.toUpperCase());
    setCurrencyState(code.toUpperCase());
  }, []);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: timezone,
      }),
    [locale, timezone],
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
    [locale],
  );

  const formatDate = useCallback(
    (value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => {
      if (!value) return '—';
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return '—';
      if (options) {
        return new Intl.DateTimeFormat(locale, { ...options, timeZone: timezone }).format(date);
      }
      return dateFormatter.format(date);
    },
    [dateFormatter, locale, timezone],
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      if (options) return new Intl.NumberFormat(locale, options).format(value);
      return numberFormatter.format(value);
    },
    [locale, numberFormatter],
  );

  const formatCurrency = useCallback(
    (value: number, code?: string) => {
      const curr = code ?? currency;
      const zeroDec = curr === 'CLP' || curr === 'JPY';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: curr,
        maximumFractionDigits: zeroDec ? 0 : 2,
      }).format(value);
    },
    [currency, locale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      timezone,
      currency,
      ready,
      supportedLocales: SUPPORTED_LOCALES,
      setLocale,
      setTimezone,
      setCurrency,
      formatDate,
      formatNumber,
      formatCurrency,
    }),
    [locale, timezone, currency, ready, setLocale, setTimezone, setCurrency, formatDate, formatNumber, formatCurrency],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale debe usarse dentro de LocaleProvider');
  return ctx;
}
