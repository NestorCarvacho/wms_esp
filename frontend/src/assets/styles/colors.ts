/**
 * Tokens WMS → clases Tailwind (`className`).
 * Para estilos inline puntuales (calendario, checkbox) usar `palette`.
 */
export const colorClass = {
  brand: 'text-blue-800',
  brandLight: 'text-blue-600',
  brandBg: 'bg-blue-50',
  brandBgStrong: 'bg-blue-100',
  accent: 'text-orange-600',
  accentHover: 'hover:text-orange-700',
  muted: 'text-muted-foreground',
  subtle: 'text-slate-500',
  body: 'text-slate-700',
  emphasis: 'text-slate-900',
  destructive: 'text-destructive',
  success: 'text-emerald-600',
  successIcon: 'text-emerald-500',
  alert: 'text-amber-500',
  border: 'border-border',
  borderSubtle: 'border-slate-200',
  bgSubtle: 'bg-slate-50',
  bgMuted: 'bg-muted',
  iconMuted: 'text-slate-500',
  iconActive: 'text-orange-600',
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
