/**
 * RecepcionSerializadaPanel
 * Flujo "producto primero": el operador selecciona el producto, escanea
 * los números de serie uno a uno, puede cambiar de producto sin perder
 * lo ya escaneado, y al final confirma todo en un solo lote.
 *
 * Soporta múltiples grupos (un grupo = un producto + sus series).
 * Valida duplicados localmente antes de enviar.
 */
import { useCallback, useRef, useState } from 'react';
import { recepcionarSerie } from '@/api/serieProducto';
import { PrimaryButton } from '@/components/ui/buttons';
import { Card } from '@/components/ui/cards';
import { LabelInput } from '@/components/ui/inputs';
import { Text } from '@/components/ui/text/Text';
import { useCrudUi } from '@/crud/useCrudUi';
import type { Bodega, Producto, ZonaBodega } from '@/types/api';
import { nuevaLineId } from '@/pages/inventario/lineasEscaneadas';
import { cn } from '@/lib/utils';

// ─── tipos internos ──────────────────────────────────────────────────────────

interface GrupoSerie {
  groupId: string;
  producto: Producto;
  /** Números de serie únicos para este grupo (en el orden de escaneo). */
  series: string[];
}

interface RecepcionSerializadaPanelProps {
  bodegas: Bodega[];
  zonas: ZonaBodega[];
  /** Lista completa de productos; se filtran los serializados en el selector. */
  productos: Producto[];
  empresaIdParam?: number;
  opBodega: string;
  onOpBodegaChange: (id: string) => void;
  zonaDestino: string;
  onZonaDestinoChange: (id: string) => void;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function todasLasSeries(grupos: GrupoSerie[]): string[] {
  return grupos.flatMap((g) => g.series);
}

function duplicadoEnGrupos(grupos: GrupoSerie[], serie: string): boolean {
  return todasLasSeries(grupos).includes(serie);
}

// ─── componente ──────────────────────────────────────────────────────────────

const selectClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

export function RecepcionSerializadaPanel({
  bodegas,
  zonas,
  productos,
  opBodega,
  onOpBodegaChange,
  zonaDestino,
  onZonaDestinoChange,
}: RecepcionSerializadaPanelProps) {
  const { notifyApiError, notifySuccess } = useCrudUi();

  // Selector de producto
  const [busqueda, setBusqueda] = useState('');
  const [productoActual, setProductoActual] = useState<Producto | null>(null);

  // Grupos acumulados (un grupo por producto seleccionado)
  const [grupos, setGrupos] = useState<GrupoSerie[]>([]);

  // Buffer del escáner
  const [scanBuffer, setScanBuffer] = useState('');
  const scanRef = useRef<HTMLInputElement>(null);

  // Documento
  const [docTipo, setDocTipo] = useState('');
  const [docFolio, setDocFolio] = useState('');
  const [obs, setObs] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Solo productos serializados en el selector
  const serializados = productos.filter((p) => p.serializado);
  const productosFiltrados = busqueda.trim()
    ? serializados.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.sku.toLowerCase().includes(busqueda.toLowerCase()),
      )
    : serializados;

  const focusScan = useCallback(() => {
    scanRef.current?.focus();
  }, []);

  // ── Seleccionar producto ─────────────────────────────────────────────────

  const seleccionarProducto = useCallback(
    (p: Producto) => {
      setProductoActual(p);
      setBusqueda('');
      // Si ya existe un grupo para este producto, activarlo; si no, crear uno nuevo
      setGrupos((prev) => {
        const existe = prev.find((g) => g.producto.id === p.id);
        if (!existe) {
          return [...prev, { groupId: nuevaLineId(), producto: p, series: [] }];
        }
        return prev;
      });
      setTimeout(() => focusScan(), 80);
    },
    [focusScan],
  );

  // ── Escanear serie ───────────────────────────────────────────────────────

  const procesarSerie = useCallback(
    (valor: string) => {
      const serie = valor.trim();
      if (!serie) return;

      if (!productoActual) {
        notifyApiError(new Error('Selecciona un producto antes de escanear'), 'Producto requerido');
        return;
      }
      if (!opBodega) {
        notifyApiError(new Error('Selecciona la bodega antes de escanear'), 'Bodega requerida');
        return;
      }

      // Detectar duplicado global (entre todos los grupos)
      if (duplicadoEnGrupos(grupos, serie)) {
        notifyApiError(
          new Error(`El número de serie «${serie}» ya fue escaneado`),
          'Serie duplicada',
        );
        setScanBuffer('');
        focusScan();
        return;
      }

      // Agregar al grupo del producto actual
      setGrupos((prev) =>
        prev.map((g) =>
          g.producto.id === productoActual.id
            ? { ...g, series: [...g.series, serie] }
            : g,
        ),
      );

      notifySuccess(`Serie ${serie} → ${productoActual.nombre}`);
      setScanBuffer('');
      focusScan();
    },
    [productoActual, opBodega, grupos, notifyApiError, notifySuccess, focusScan],
  );

  const onScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      procesarSerie(scanBuffer);
    }
  };

  // ── Quitar serie de un grupo ─────────────────────────────────────────────

  const quitarSerie = (groupId: string, serie: string) => {
    setGrupos((prev) =>
      prev.map((g) =>
        g.groupId === groupId ? { ...g, series: g.series.filter((s) => s !== serie) } : g,
      ),
    );
  };

  // ── Quitar grupo completo ────────────────────────────────────────────────

  const quitarGrupo = (groupId: string) => {
    setGrupos((prev) => {
      const nuevo = prev.filter((g) => g.groupId !== groupId);
      // Si el grupo activo fue quitado, limpiar productoActual
      const activo = prev.find((g) => g.groupId === groupId);
      if (activo && productoActual?.id === activo.producto.id) {
        setProductoActual(null);
      }
      return nuevo;
    });
  };

  // ── Total de series pendientes ───────────────────────────────────────────

  const totalSeries = grupos.reduce((sum, g) => sum + g.series.length, 0);
  const hayDatos = totalSeries > 0;

  // ── Guardar lote ─────────────────────────────────────────────────────────

  const registrarLote = async () => {
    if (!opBodega) {
      notifyApiError(new Error('Selecciona la bodega'), 'Bodega requerida');
      return;
    }
    if (!hayDatos) {
      notifyApiError(new Error('No hay series para registrar'), 'Lista vacía');
      return;
    }

    // Validación final de duplicados (por si acaso)
    const todas = todasLasSeries(grupos);
    const unicos = new Set(todas);
    if (todas.length !== unicos.size) {
      notifyApiError(
        new Error('Existen números de serie duplicados en la lista'),
        'Duplicados detectados',
      );
      return;
    }

    const doc = {
      documento_tipo: docTipo || undefined,
      documento_folio: docFolio || undefined,
      observaciones: obs || undefined,
    };

    setSubmitting(true);
    let ok = 0;
    const errores: string[] = [];

    // Enviar serie a serie (el backend ya maneja idempotencia y FK)
    for (const grupo of grupos) {
      for (const serie of grupo.series) {
        try {
          await recepcionarSerie({
            producto_id: grupo.producto.id,
            numero_serie: serie,
            bodega_id: Number(opBodega),
            zona_destino_id: zonaDestino ? Number(zonaDestino) : undefined,
            ...doc,
          });
          ok += 1;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error';
          errores.push(`[${grupo.producto.sku}] ${serie}: ${msg}`);
        }
      }
    }

    setSubmitting(false);

    if (errores.length === 0) {
      notifySuccess(`${ok} serie(s) recepcionada(s) correctamente`);
      setGrupos([]);
      setProductoActual(null);
      setDocTipo('');
      setDocFolio('');
      setObs('');
    } else if (ok > 0) {
      notifyApiError(
        new Error(errores.join('\n')),
        `${ok} registradas, ${errores.length} con error`,
      );
      // Eliminar las que se guardaron correctamente
      const fallidas = new Set(errores.map((e) => e.split(': ')[0].split('] ')[1]));
      setGrupos((prev) =>
        prev
          .map((g) => ({ ...g, series: g.series.filter((s) => fallidas.has(s)) }))
          .filter((g) => g.series.length > 0),
      );
    } else {
      notifyApiError(new Error(errores.join('\n')), 'No se pudo registrar el lote');
    }
  };

  // ─── render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* ── Panel izquierdo: resumen de grupos ── */}
      <div className="w-full shrink-0 lg:w-72 xl:w-80">
        <div className="flex h-full min-h-[320px] flex-col rounded-lg border border-border bg-muted/40 dark:bg-muted/20">
          <div className="border-b border-border bg-card px-3 py-2">
            <Text variant="body-medium" className="font-medium text-foreground">
              Series a recepcionar
            </Text>
            <Text variant="body-regular" className="text-muted-foreground">
              {grupos.length} producto(s) · {totalSeries} serie(s)
            </Text>
          </div>

          <ul className="flex-1 overflow-y-auto p-2">
            {grupos.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                Selecciona un producto y escanea sus números de serie.
              </li>
            ) : (
              grupos.map((grupo) => (
                <li
                  key={grupo.groupId}
                  className={cn(
                    'mb-3 rounded-md border p-2 shadow-sm last:mb-0',
                    productoActual?.id === grupo.producto.id
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                      : 'border-border bg-card',
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <code className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {grupo.producto.sku}
                      </code>
                      <p className="truncate text-sm font-medium text-foreground">
                        {grupo.producto.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {grupo.series.length} serie(s)
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <button
                        type="button"
                        className="text-xs text-blue-600 underline dark:text-blue-300"
                        onClick={() => seleccionarProducto(grupo.producto)}
                      >
                        Activar
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-500 underline"
                        onClick={() => quitarGrupo(grupo.groupId)}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                  {/* Lista de series del grupo */}
                  {grupo.series.length > 0 && (
                    <ul className="mt-2 max-h-36 overflow-y-auto space-y-0.5">
                      {grupo.series.map((s) => (
                        <li
                          key={s}
                          className="flex items-center justify-between rounded bg-white/60 px-1.5 py-0.5 text-xs dark:bg-white/5"
                        >
                          <span className="font-mono text-foreground">{s}</span>
                          <button
                            type="button"
                            className="ml-2 text-red-400 hover:text-red-600"
                            onClick={() => quitarSerie(grupo.groupId, s)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* ── Panel derecho: controles ── */}
      <Card className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <Text variant="body-medium" className="font-medium text-foreground">
          Recepción serializada — por producto
        </Text>

        {/* Bodega */}
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

        {/* Zona destino */}
        <label className="text-sm font-medium text-foreground">Zona destino (opcional)</label>
        <select
          className={selectClass}
          value={zonaDestino}
          onChange={(e) => onZonaDestinoChange(e.target.value)}
          disabled={submitting || !opBodega}
        >
          <option value="">Usar zona por defecto de bodega</option>
          {zonas.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre ?? z.tipo_zona_nombre}
            </option>
          ))}
        </select>

        {/* ── Selector de producto ── */}
        <label className="text-sm font-medium text-foreground">
          Producto a recepcionar
        </label>

        {productoActual ? (
          <div className="flex items-center justify-between rounded-md border border-blue-400 bg-blue-50 px-3 py-2 dark:bg-blue-950">
            <div>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {productoActual.sku}
              </span>
              <p className="text-sm font-medium text-foreground">{productoActual.nombre}</p>
            </div>
            <button
              type="button"
              className="text-xs text-blue-600 underline dark:text-blue-300"
              onClick={() => setProductoActual(null)}
            >
              Cambiar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Buscar por nombre o SKU…"
              className={selectClass}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={submitting}
              autoComplete="off"
            />
            {busqueda.trim() && (
              <ul className="max-h-48 overflow-y-auto rounded-md border border-border bg-background shadow-md">
                {productosFiltrados.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    Sin resultados (solo se muestran productos serializados)
                  </li>
                ) : (
                  productosFiltrados.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => seleccionarProducto(p)}
                      >
                        <code className="text-xs text-blue-600">{p.sku}</code>
                        <span className="text-foreground">{p.nombre}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
            {!busqueda.trim() && serializados.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay productos con inventario serializado activado.
              </p>
            )}
          </div>
        )}

        {/* ── Input de escaneo (activo solo cuando hay producto seleccionado) ── */}
        <label className="text-sm font-medium text-foreground" htmlFor="serie-scan-input">
          Número de serie
        </label>
        <input
          id="serie-scan-input"
          ref={scanRef}
          type="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={submitting || !productoActual}
          placeholder={
            productoActual
              ? 'Apunte la pistola aquí y escanee…'
              : 'Selecciona un producto primero'
          }
          className={cn(
            selectClass,
            'font-mono text-base',
            !productoActual && 'opacity-50 cursor-not-allowed',
          )}
          value={scanBuffer}
          onChange={(e) => setScanBuffer(e.target.value)}
          onKeyDown={onScanKeyDown}
        />

        {productoActual && (
          <Text variant="body-regular" className="text-muted-foreground">
            Escaneando series para{' '}
            <strong>{productoActual.nombre}</strong>.{' '}
            {grupos.find((g) => g.producto.id === productoActual.id)?.series.length ?? 0} serie(s) registrada(s).
            Usa "Cambiar" para agregar otro producto sin perder lo ya escaneado.
          </Text>
        )}

        {/* Documento */}
        <LabelInput id="rs-doc-tipo" label="Documento (tipo)" value={docTipo} onChange={setDocTipo} />
        <LabelInput id="rs-doc-folio" label="Folio" value={docFolio} onChange={setDocFolio} />
        <LabelInput id="rs-obs" label="Observaciones" value={obs} onChange={setObs} />

        {/* ── Botón confirmar ── */}
        <PrimaryButton
          type="button"
          disabled={submitting || !hayDatos || !opBodega}
          onClick={() => void registrarLote()}
        >
          {submitting
            ? 'Registrando…'
            : `Recepcionar ${totalSeries} serie(s) en ${grupos.length} producto(s)`}
        </PrimaryButton>
      </Card>
    </div>
  );
}
