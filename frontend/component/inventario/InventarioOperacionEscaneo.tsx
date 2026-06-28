import { useCallback, useMemo, useRef, useState } from 'react';
import { buscarProductoPorSku, indiceProductosPorSku, resolverBarcode } from '@/api/productoPorSku';
import {
  despacharInventario,
  recepcionarInventario,
  trasladarInventario,
} from '@/api/inventario';
import { recepcionarSerie, trasladarSerie, despacharSerie, ubicarSerie } from '@/api/serieProducto';
import { PrimaryButton } from '@/components/ui/buttons';
import { Card } from '@/components/ui/cards';
import { LabelInput } from '@/components/ui/inputs';
import { Text } from '@/components/ui/text/Text';
import { InventarioLineasEscaneadas } from '@/components/inventario/InventarioLineasEscaneadas';
import { useCrudUi } from '@/crud/useCrudUi';
import type { Bodega, Producto, ZonaBodega } from '@/types/api';
import type { InventarioVista } from '@/pages/inventario/inventarioViews';
import {
  agregarEscaneo,
  agregarSerie,
  quitarLinea,
  quitarSerie,
  actualizarCantidadLinea,
  type LineaEscaneada,
  type LineaSerie,
} from '@/pages/inventario/lineasEscaneadas';

interface InventarioOperacionEscaneoProps {
  vista: Extract<InventarioVista, 'recepcion' | 'traslado' | 'despacho'>;
  titulo: string;
  bodegas: Bodega[];
  zonas: ZonaBodega[];
  productos: Producto[];
  empresaIdParam?: number;
  opBodega: string;
  onOpBodegaChange: (id: string) => void;
  zonaOrigen: string;
  onZonaOrigenChange: (id: string) => void;
  zonaDestino: string;
  onZonaDestinoChange: (id: string) => void;
}

export function InventarioOperacionEscaneo({
  vista,
  titulo,
  bodegas,
  zonas,
  productos,
  empresaIdParam,
  opBodega,
  onOpBodegaChange,
  zonaOrigen,
  onZonaOrigenChange,
  zonaDestino,
  onZonaDestinoChange,
}: InventarioOperacionEscaneoProps) {
  const { notifyApiError, notifySuccess } = useCrudUi();
  const [lineas, setLineas] = useState<LineaEscaneada[]>([]);
  const [scanBuffer, setScanBuffer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [docTipo, setDocTipo] = useState('');
  const [docFolio, setDocFolio] = useState('');
  const [obs, setObs] = useState('');
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Modo serie: el usuario escaneó un producto serializado y ahora cada scan es un nº de serie
  const [serieMode, setSerieMode] = useState<{ producto: Producto } | null>(null);
  const [seriesEscaneadas, setSeriesEscaneadas] = useState<LineaSerie[]>([]);

  const skuIndex = useMemo(() => indiceProductosPorSku(productos), [productos]);

  const focusScanner = useCallback(() => {
    scanInputRef.current?.focus();
  }, []);

  const salirModoSerie = useCallback(() => {
    setSerieMode(null);
    setSeriesEscaneadas([]);
  }, []);

  const procesarCodigo = useCallback(
    async (codigo: string) => {
      const term = codigo.trim();
      if (!term) return;

      if (!opBodega) {
        notifyApiError(new Error('Seleccione la bodega antes de escanear'), 'Bodega requerida');
        return;
      }

      try {
        // --- MODO SERIE ACTIVO: cada scan es un número de serie ---
        if (serieMode) {
          if (vista === 'recepcion') {
            // Solo validamos que no sea duplicado localmente; el API lo rechazará si ya existe en BD
            setSeriesEscaneadas((prev) => agregarSerie(prev, serieMode.producto, term));
            notifySuccess(`Serie ${term} agregada`);
          } else {
            // Para traslado/despacho: buscar la serie directamente en el sistema
            const serie = await ubicarSerie(term);
            setSeriesEscaneadas((prev) => agregarSerie(prev, serieMode.producto, serie.numero_serie));
            notifySuccess(`Serie ${serie.numero_serie} · ${serie.zona_nombre ?? 'sin zona'}`);
          }
          return;
        }

        // --- MODO NORMAL: resolver producto por barcode o SKU ---

        // 1. Intentar como código de barras de presentación
        const barcode = await resolverBarcode(term, empresaIdParam);
        if (barcode) {
          const key = barcode.sku.trim().toLowerCase();
          const local = skuIndex.get(key);
          const producto: Producto | null = local ?? (await buscarProductoPorSku(barcode.sku, empresaIdParam));
          if (producto) {
            if (producto.serializado) {
              setSerieMode({ producto });
              notifySuccess(`Modo serie activado: ${producto.nombre} — escanee cada número de serie`);
              return;
            }
            setLineas((prev) =>
              agregarEscaneo(prev, {
                producto,
                cantidadPorEscaneo: barcode.factor_conversion,
                presentacionId: barcode.presentacion_id,
                presentacionNombre: barcode.presentacion_nombre,
              }),
            );
            notifySuccess(`${producto.sku} · ${barcode.presentacion_nombre} (+${barcode.factor_conversion} ${barcode.unidad_base ?? 'UN'})`);
            return;
          }
        }

        // 2. Fallback: resolver por SKU
        const key = term.toLowerCase();
        const local = skuIndex.get(key);
        const producto: Producto | null = local ?? (await buscarProductoPorSku(term, empresaIdParam));

        if (!producto) {
          // 3. Para traslado/despacho: intentar como número de serie directamente
          if (vista !== 'recepcion') {
            try {
              const serie = await ubicarSerie(term);
              const prod = productos.find((p) => p.id === serie.producto_id) ?? null;
              if (prod) {
                setSerieMode({ producto: prod });
                setSeriesEscaneadas((prev) => agregarSerie(prev, prod, serie.numero_serie));
                notifySuccess(`Serie ${serie.numero_serie} · ${prod.nombre}`);
                return;
              }
            } catch {
              // no es una serie conocida
            }
          }
          notifyApiError(new Error(`No se encontró producto con código «${term}»`), 'Código no reconocido');
          return;
        }

        if (producto.serializado) {
          setSerieMode({ producto });
          notifySuccess(`Modo serie activado: ${producto.nombre} — escanee cada número de serie`);
          return;
        }

        setLineas((prev) => agregarEscaneo(prev, { producto }));
        notifySuccess(`${producto.sku} agregado`);
      } catch (err) {
        notifyApiError(err, 'Error al buscar producto');
      } finally {
        setScanBuffer('');
        focusScanner();
      }
    },
    [opBodega, serieMode, vista, skuIndex, empresaIdParam, productos, notifyApiError, notifySuccess, focusScanner],
  );

  const onScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void procesarCodigo(scanBuffer);
    }
  };

  const validarContexto = (): string | null => {
    if (vista === 'recepcion' && !opBodega) return 'Seleccione bodega';
    if (vista === 'traslado') {
      if (!opBodega) return 'Seleccione bodega';
      if (!zonaOrigen || !zonaDestino) return 'Indique zona origen y destino';
    }
    if (vista === 'despacho') {
      if (!opBodega) return 'Seleccione bodega';
      if (!zonaOrigen) return 'Indique zona de origen';
    }
    if (lineas.length === 0 && seriesEscaneadas.length === 0) return 'Escanee al menos un producto';
    return null;
  };

  const registrarLote = async () => {
    const errMsg = validarContexto();
    if (errMsg) {
      notifyApiError(new Error(errMsg), 'Datos incompletos');
      return;
    }

    const doc = {
      documento_tipo: docTipo || undefined,
      documento_folio: docFolio || undefined,
      observaciones: obs || undefined,
    };

    setSubmitting(true);
    const pendientes: LineaEscaneada[] = [];
    const pendientesSeries: LineaSerie[] = [];
    const errores: string[] = [];
    let ok = 0;
    const total = lineas.length + seriesEscaneadas.length;

    for (const linea of lineas) {
      try {
        const base = {
          producto_id: linea.productoId,
          cantidad: linea.cantidad,
          presentacion_id: linea.presentacionId ?? undefined,
          ...doc,
        };
        if (vista === 'recepcion') {
          await recepcionarInventario(
            {
              ...base,
              bodega_id: Number(opBodega),
              zona_destino_id: zonaDestino ? Number(zonaDestino) : undefined,
            },
            empresaIdParam,
          );
        } else if (vista === 'traslado') {
          await trasladarInventario(
            {
              ...base,
              zona_origen_id: Number(zonaOrigen),
              zona_destino_id: Number(zonaDestino),
            },
            empresaIdParam,
          );
        } else {
          await despacharInventario(
            {
              ...base,
              zona_origen_id: Number(zonaOrigen),
            },
            empresaIdParam,
          );
        }
        ok += 1;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error';
        errores.push(`${linea.sku}: ${msg}`);
        pendientes.push(linea);
      }
    }

    // Registrar series (inventario serializado)
    for (const serie of seriesEscaneadas) {
      try {
        if (vista === 'recepcion') {
          await recepcionarSerie({
            producto_id: serie.productoId,
            numero_serie: serie.numeroSerie,
            bodega_id: Number(opBodega),
            zona_destino_id: zonaDestino ? Number(zonaDestino) : undefined,
            ...doc,
          });
        } else if (vista === 'traslado') {
          await trasladarSerie({
            numero_serie: serie.numeroSerie,
            zona_origen_id: Number(zonaOrigen),
            zona_destino_id: Number(zonaDestino),
            ...doc,
          });
        } else {
          await despacharSerie({
            numero_serie: serie.numeroSerie,
            zona_origen_id: Number(zonaOrigen),
            ...doc,
          });
        }
        ok += 1;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error';
        errores.push(`Serie ${serie.numeroSerie}: ${msg}`);
        pendientesSeries.push(serie);
      }
    }

    setSubmitting(false);
    setLineas(pendientes);
    setSeriesEscaneadas(pendientesSeries);
    if (pendientesSeries.length === 0 && serieMode) salirModoSerie();

    if (ok === total) {
      notifySuccess(`${ok} movimiento(s) registrado(s)`);
      setDocTipo('');
      setDocFolio('');
      setObs('');
      focusScanner();
    } else if (ok > 0) {
      notifyApiError(
        new Error(errores.join('\n')),
        `Registrados ${ok} de ${total}. Quedan líneas pendientes.`,
      );
    } else {
      notifyApiError(new Error(errores.join('\n')), 'No se pudo registrar el lote');
    }
  };

  const selectClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 lg:w-72 xl:w-80">
        <InventarioLineasEscaneadas
          lineas={lineas}
          onQuitar={(lineId: string) => setLineas((prev) => quitarLinea(prev, lineId))}
          onCantidadChange={(lineId: string, qty: number) =>
            setLineas((prev) => actualizarCantidadLinea(prev, lineId, qty))
          }
          disabled={submitting}
        />
      </div>

      <Card className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <Text variant="body-medium" className="font-medium text-foreground">
          {titulo} — escaneo
        </Text>

        <label className="text-sm font-medium text-foreground">Bodega</label>
        <select
          className={selectClass}
          value={opBodega}
          onChange={(e) => onOpBodegaChange(e.target.value)}
          disabled={submitting}
        >
          <option value="">Seleccione…</option>
          {bodegas.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>

        {(vista === 'traslado' || vista === 'despacho') && (
          <>
            <label className="text-sm font-medium text-foreground">Zona origen</label>
            <select
              className={selectClass}
              value={zonaOrigen}
              onChange={(e) => onZonaOrigenChange(e.target.value)}
              disabled={submitting || !opBodega}
            >
              <option value="">Seleccione…</option>
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre || z.tipo_zona_nombre}
                </option>
              ))}
            </select>
          </>
        )}

        {(vista === 'recepcion' || vista === 'traslado') && (
          <>
            <label className="text-sm font-medium text-foreground">
              {vista === 'recepcion' ? 'Zona destino (opcional)' : 'Zona destino'}
            </label>
            <select
              className={selectClass}
              value={zonaDestino}
              onChange={(e) => onZonaDestinoChange(e.target.value)}
              disabled={submitting || !opBodega}
            >
              <option value="">
                {vista === 'recepcion' ? 'Usar zona por defecto de bodega' : 'Seleccione…'}
              </option>
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre || z.tipo_zona_nombre}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Banner modo serie */}
        {serieMode && (
          <div className="rounded-md border border-blue-400 bg-blue-50 px-3 py-2 text-sm dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Modo serie: {serieMode.producto.nombre}
              </span>
              <button
                type="button"
                onClick={salirModoSerie}
                className="text-xs text-blue-600 underline dark:text-blue-300"
              >
                Salir
              </button>
            </div>
            <div className="mt-1 text-blue-700 dark:text-blue-300">
              {seriesEscaneadas.length} serie(s) escaneada(s) — escanee cada unidad individual
            </div>
            {seriesEscaneadas.length > 0 && (
              <ul className="mt-1 max-h-28 overflow-y-auto text-xs text-blue-600 dark:text-blue-400">
                {seriesEscaneadas.map((s) => (
                  <li key={s.lineId} className="flex items-center justify-between">
                    <span className="font-mono">{s.numeroSerie}</span>
                    <button
                      type="button"
                      onClick={() => setSeriesEscaneadas((prev) => quitarSerie(prev, s.lineId))}
                      className="ml-2 text-red-500"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <label className="text-sm font-medium text-foreground" htmlFor="inv-scan-input">
          {serieMode ? 'Número de serie' : 'Código de barras / SKU'}
        </label>
        <input
          id="inv-scan-input"
          ref={scanInputRef}
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={submitting}
          placeholder="Apunte la pistola aquí y escanee…"
          className={`${selectClass} font-mono text-base`}
          value={scanBuffer}
          onChange={(e) => setScanBuffer(e.target.value)}
          onKeyDown={onScanKeyDown}
        />
        <Text variant="body-regular" className="text-muted-foreground">
          Configure bodega y zonas arriba, luego haga clic en este campo y escanee (Enter confirma).
          Si el código corresponde a una presentación (caja, display, etc.) se suma automáticamente
          el factor de conversión. Corrija cantidades o use Quitar en la lista.
        </Text>

        <LabelInput
          id="inv-doc-tipo"
          label="Documento (tipo)"
          value={docTipo}
          onChange={setDocTipo}
        />
        <LabelInput id="inv-doc-folio" label="Folio" value={docFolio} onChange={setDocFolio} />
        <LabelInput id="inv-obs" label="Observaciones" value={obs} onChange={setObs} />

        <PrimaryButton
          type="button"
          disabled={submitting || (lineas.length === 0 && seriesEscaneadas.length === 0)}
          onClick={() => void registrarLote()}
        >
          {submitting
            ? 'Registrando…'
            : `Registrar ${lineas.length + seriesEscaneadas.length} línea(s)`}
        </PrimaryButton>
      </Card>
    </div>
  );
}
