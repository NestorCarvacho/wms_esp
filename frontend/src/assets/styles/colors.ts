/**
 * Tokens WMS → clases Tailwind (`className`).
 * Incluyen variantes `dark:` para modo oscuro.
 * Para estilos inline puntuales (calendario, checkbox) usar `palette`.
 */
export const colorClass = {
  brand: 'text-blue-800 dark:text-blue-300',
  brandLight: 'text-blue-600 dark:text-blue-400',
  brandBg: 'bg-blue-50 dark:bg-blue-950/50',
  brandBgStrong: 'bg-blue-100 dark:bg-blue-900/40',
  accent: 'text-orange-600 dark:text-orange-400',
  accentHover: 'hover:text-orange-700 dark:hover:text-orange-300',
  muted: 'text-muted-foreground',
  subtle: 'text-slate-500 dark:text-slate-400',
  body: 'text-slate-700 dark:text-slate-300',
  emphasis: 'text-slate-900 dark:text-slate-100',
  destructive: 'text-destructive',
  success: 'text-emerald-600 dark:text-emerald-400',
  successIcon: 'text-emerald-500 dark:text-emerald-400',
  alert: 'text-amber-500 dark:text-amber-400',
  border: 'border-border',
  borderSubtle: 'border-slate-200 dark:border-slate-700',
  bgSubtle: 'bg-slate-50 dark:bg-slate-800/50',
  bgMuted: 'bg-muted',
  iconMuted: 'text-slate-500 dark:text-slate-400',
  iconActive: 'text-orange-600 dark:text-orange-400',
  /** Texto secundario (antes `text-neutral-500`) */
  hint: 'text-neutral-500 dark:text-neutral-400',
  /** Texto de párrafo (antes `text-neutral-600`–`800`) */
  paragraph: 'text-neutral-700 dark:text-neutral-300',
} as const;

/** Hex para `style={{}}` legacy; evitar en componentes nuevos. */
export const palette = {
  brand: '#1565C0',
  brandDark: '#0D47A1',
  brandLight: '#1976D2',
  brandAux: '#42A5F5',
  brandBg: '#E3F2FD',
  brandBg200: '#BBDEFB',
  accent: '#FF6F00',
  accentMid: '#FB8C00',
  white: '#FFFFFF',
  ink: '#1A1A1A',
  body: '#333333',
  muted: '#999999',
  border: '#E5E5E5',
  disabled: '#CCCCCC',
  surface: '#FAFAFA',
  error: '#EF5350',
  errorText: '#E53935',
  errorBg: '#FFEBEE',
  errorBorder: '#EF5350',
  success: '#43A047',
  successText: '#43A047',
  successBg: '#E8F5E9',
  successBorder: '#A5D6A7',
  alert: '#FFB74D',
} as const;
