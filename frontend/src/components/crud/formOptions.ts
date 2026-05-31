const ACTIVO_OPTIONS = [
  { label: 'Activo', value: '1' },
  { label: 'Inactivo', value: '0' },
];

export { ACTIVO_OPTIONS };

export function boolToActivoValue(value: boolean): string {
  return value ? '1' : '0';
}

export function activoValueToNumber(value: string): number {
  return value === '1' ? 1 : 0;
}
