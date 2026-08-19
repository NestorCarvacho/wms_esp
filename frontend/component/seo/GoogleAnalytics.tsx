import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Carga GA4 si VITE_GA_MEASUREMENT_ID está configurado. */
export function GoogleAnalytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!GA_ID) return;

    if (!window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer ?? [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID);
    }

    window.gtag?.('config', GA_ID, { page_path: pathname });
  }, [pathname]);

  return null;
}
