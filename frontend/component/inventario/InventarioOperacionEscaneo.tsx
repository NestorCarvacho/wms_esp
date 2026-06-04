import { useCallback, useMemo, useRef, useState } from 'react';
import { buscarProductoPorSku, indiceProductosPorSku } from '@/api/productoPorSku';
import {
  despacharInventario,
  recepcionarInventario,
  trasladarInventario,
} from '@/api/inventario';
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
  quitarLinea,
  actualizarCantidadLinea,
  type LineaEscaneada,
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

  const skuIndex = useMemo(() => indiceProductosPorSku(productos), [productos]);

  const focusScanner = useCallback(() => {
    scanInputRef.current?.focus();
  }, []);

  const resolverProducto = useCallback(
    async (codigo: string): Promise<Producto | null> => {
      const key = codigo.trim().toLowerCase();
      const local = skuIndex.get(key);
      if (local) return local;
      return buscarProductoPorSku(codigo, empresaIdParam);
    },
    [skuIndex, empresaIdParam],
  );

  const procesarCodigo = useCallback(
    async (codigo: string) => {
      const term = codigo.trim();
      if (!term) return;

      if (!opBodega) {
        notifyApiError(new Error('Seleccione la bodega antes de escanear'), 'Bodega requerida');
        return;
      }

      try {
        const producto = await resolverProducto(term);
        if (!producto) {
          notifyApiError(
            new Error(`No se encontró producto con SKU «${term}»`),
            'Código no reconocido',
          );
          return;
        }
        setLineas((prev) => agregarEscaneo(prev, producto));
        notifySuccess(`${producto.sku} agregado`);
      } catch (err) {
        notifyApiError(err, 'Error al buscar producto');
      } finally {
        setScanBuffer('');
        focusScanner();
      }
    },
    [opBodega, resolverProducto, notifyApiError, notifySuccess, focusScanner],
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
    if (lineas.length === 0) return 'Escanee al menos un producto';
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
    const errores: string[] = [];
    let ok = 0;
    const total = lineas.length;

    for (const linea of lineas) {
      try {
        const base = {
          producto_id: linea.productoId,
          cantidad: linea.cantidad,
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

    setSubmitting(false);
    setLineas(pendientes);

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

        <label className="text-sm font-medium text-foreground" htmlFor="inv-scan-input">
          Código de barras / SKU
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
        <Text variant="body-regular" color="#666">
          Configure bodega y zonas arriba, luego haga clic en este campo y escanee (Enter confirma).
          Cada lectura suma 1 unidad; corrija cantidades o use Quitar en la lista.
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
          disabled={submitting || lineas.length === 0}
          onClick={() => void registrarLote()}
        >
          {submitting ? 'Registrando…' : `Registrar ${lineas.length} línea(s)`}
        </PrimaryButton>
      </Card>
    </div>
  );
}
