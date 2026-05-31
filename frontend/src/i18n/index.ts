const FALLBACKS: Record<string, string> = {
  'common:actions.cancel': 'Cancelar',
  'common:actions.delete': 'Eliminar',
  'common:actions.confirm': 'Confirmar',
  'common:actions.export': 'Exportar',
};

export function useTranslation() {
  return {
    t: (key: string) => FALLBACKS[key] ?? key,
  };
}
