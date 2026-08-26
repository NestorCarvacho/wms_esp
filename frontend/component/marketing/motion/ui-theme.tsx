import { createContext, useContext, type ReactNode } from 'react';
import type { Transition } from 'motion/react';

export type SpringTokens = { stiffness: number; damping: number };

export type MotionUITheme = {
  transitions: {
    snap: SpringTokens;
    ui: SpringTokens;
    gentle: SpringTokens;
    lively: SpringTokens;
    ambient: SpringTokens;
  };
  stagger: { tight: number; base: number; relaxed: number };
  travel: { hover: number; enter: number; section: number };
  inView: { amount: number; once: boolean };
  reducedMotion: 'calm' | 'off';
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const defaults: MotionUITheme = {
  transitions: {
    snap: { stiffness: 1218, damping: 70 },
    ui: { stiffness: 305, damping: 33 },
    gentle: { stiffness: 110, damping: 20 },
    lively: { stiffness: 622, damping: 17 },
    ambient: { stiffness: 43, damping: 13 },
  },
  stagger: { tight: 0.04, base: 0.08, relaxed: 0.15 },
  travel: { hover: 4, enter: 24, section: 48 },
  inView: { amount: 0.25, once: true },
  reducedMotion: 'calm',
};

function mergeTheme(base: MotionUITheme, partial: DeepPartial<MotionUITheme>): MotionUITheme {
  return {
    transitions: {
      snap: { ...base.transitions.snap, ...partial.transitions?.snap },
      ui: { ...base.transitions.ui, ...partial.transitions?.ui },
      gentle: { ...base.transitions.gentle, ...partial.transitions?.gentle },
      lively: { ...base.transitions.lively, ...partial.transitions?.lively },
      ambient: { ...base.transitions.ambient, ...partial.transitions?.ambient },
    },
    stagger: { ...base.stagger, ...partial.stagger },
    travel: { ...base.travel, ...partial.travel },
    inView: { ...base.inView, ...partial.inView },
    reducedMotion: partial.reducedMotion ?? base.reducedMotion,
  };
}

export function defineTheme(partial: DeepPartial<MotionUITheme> = {}): MotionUITheme {
  return mergeTheme(defaults, partial);
}

const MotionUIThemeContext = createContext<MotionUITheme>(defaults);

export function MotionUIThemeProvider({
  theme,
  children,
}: {
  theme: MotionUITheme;
  children: ReactNode;
}) {
  return <MotionUIThemeContext.Provider value={theme}>{children}</MotionUIThemeContext.Provider>;
}

export function useMotionUITheme(): MotionUITheme {
  return useContext(MotionUIThemeContext);
}

export function spring(tokens: SpringTokens): Transition {
  return { type: 'spring', stiffness: tokens.stiffness, damping: tokens.damping };
}
