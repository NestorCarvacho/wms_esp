import type { ReactNode } from 'react';
import motionTheme from '@/motion.theme';
import { MotionUIThemeProvider } from './ui-theme';

/** Árbol Motion UI exclusivo de marketing; no envuelve `/app`. */
export function MarketingMotionRoot({ children }: { children: ReactNode }) {
  return <MotionUIThemeProvider theme={motionTheme}>{children}</MotionUIThemeProvider>;
}
