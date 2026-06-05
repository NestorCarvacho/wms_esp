/**
 * Variantes de fondo para LoginLayout.
 *
 * A — Minimal pro: gradiente + grid de celdas de almacén (activa)
 * B — Tech smart: gradiente + nodos/conexiones + barcode/ubicación
 */
export type LoginBackgroundVariant = 'A' | 'B';

/** Cambia a 'B' para probar la variante tech smart. */
export const LOGIN_BACKGROUND_VARIANT: LoginBackgroundVariant = 'A';
