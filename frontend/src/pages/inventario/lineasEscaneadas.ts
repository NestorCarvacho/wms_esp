import type { Producto } from '@/types/api';

export interface LineaSerie {
  lineId: string;
  productoId: number;
  sku: string;
  nombre: string;
  numeroSerie: string;
}

export function agregarSerie(
  series: LineaSerie[],
  producto: Producto,
  numeroSerie: string,
): LineaSerie[] {
  if (series.some((s) => s.numeroSerie === numeroSerie)) return series;
  return [
    ...series,
    {
      lineId: nuevaLineId(),
      productoId: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      numeroSerie,
    },
  ];
}

export function quitarSerie(series: LineaSerie[], lineId: string): LineaSerie[] {
  return series.filter((s) => s.lineId !== lineId);
}

export interface LineaEscaneada {
  lineId: string;
  productoId: number;
  sku: string;
  nombre: string;
  cantidad: number;
  /** ID de la presentación resuelta por barcode (null = escaneado por SKU de unidad base). */
  presentacionId?: number | null;
  /** Nombre descriptivo de la presentación (ej: "Six-pack", "Caja x100"). */
  presentacionNombre?: string | null;
}

export function nuevaLineId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface EscaneoInfo {
  producto: Producto;
  cantidadPorEscaneo?: number;
  presentacionId?: number | null;
  presentacionNombre?: string | null;
}

export function agregarEscaneo(lineas: LineaEscaneada[], info: EscaneoInfo): LineaEscaneada[] {
  const { producto, cantidadPorEscaneo = 1, presentacionId = null, presentacionNombre = null } = info;
  const idx = lineas.findIndex((l) => l.productoId === producto.id);
  if (idx >= 0) {
    return lineas.map((l, i) =>
      i === idx ? { ...l, cantidad: l.cantidad + cantidadPorEscaneo } : l,
    );
  }
  return [
    ...lineas,
    {
      lineId: nuevaLineId(),
      productoId: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      cantidad: cantidadPorEscaneo,
      presentacionId,
      presentacionNombre,
    },
  ];
}

export function quitarLinea(lineas: LineaEscaneada[], lineId: string): LineaEscaneada[] {
  return lineas.filter((l) => l.lineId !== lineId);
}

export function actualizarCantidadLinea(
  lineas: LineaEscaneada[],
  lineId: string,
  cantidad: number,
): LineaEscaneada[] {
  if (cantidad <= 0) return quitarLinea(lineas, lineId);
  return lineas.map((l) => (l.lineId === lineId ? { ...l, cantidad } : l));
}

export function totalUnidades(lineas: LineaEscaneada[]): number {
  return lineas.reduce((sum, l) => sum + l.cantidad, 0);
}
