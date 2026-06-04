import type { Producto } from '@/types/api';

export interface LineaEscaneada {
  lineId: string;
  productoId: number;
  sku: string;
  nombre: string;
  cantidad: number;
}

export function nuevaLineId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function agregarEscaneo(
  lineas: LineaEscaneada[],
  producto: Producto,
  cantidadPorEscaneo = 1,
): LineaEscaneada[] {
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
