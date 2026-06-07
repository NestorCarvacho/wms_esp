import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { listarBodegas } from '@/api/bodegas';
import {
  actualizarConfigInventarioBodega,
  exportarMovimientosInventario,
  exportarStockInventario,
  listarMovimientosInventario,
  listarStockInventario,
  obtenerConfigInventarioBodega,
  obtenerDashboardInventario,
  type InventarioExportFormat,
} from '@/api/inventario';
import { InventarioDashboardCharts } from '@/components/inventario/InventarioDashboardCharts';
import { InventarioOperacionEscaneo } from '@/components/inventario/InventarioOperacionEscaneo';
import { InventarioOperativoNav } from '@/components/inventario/InventarioOperativoNav';
import { listarProductos } from '@/api/productos';
import { listarZonasBodega } from '@/api/zonasBodega';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Card } from '@/components/ui/cards';
import { Table } from '@/components/ui/tables';
import { Text } from '@/components/ui/text/Text';
import { colorClass } from '@/assets/styles/colors';
import { CrudEmpresaFilterCard } from '@/components/crud/CrudEmpresaFilterCard';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import { useCrudUi } from '@/crud/useCrudUi';
import type {
  Bodega,
  InventarioDashboardResumen,
  MovimientoInventarioItem,
  Producto,
  StockZonaItem,
  ZonaBodega,
} from '@/types/api';
import {
  INVENTARIO_NAV_ITEMS,
  INVENTARIO_ROUTE_PATHS,
  INVENTARIO_VISTA_META,
  type InventarioVista,
} from '@/pages/inventario/inventarioViews';
import { usePermissions } from '@/hooks/usePermissions';
import { appPath } from '@/routes/paths';

const OP_VISTAS: InventarioVista[] = ['recepcion', 'traslado', 'despacho'];

function needsMaestros(vista: InventarioVista): boolean {
  return OP_VISTAS.includes(vista) || vista === 'configuracion';
}

interface InventarioPageProps {
  vista: InventarioVista;
}

export function InventarioPage({ vista }: InventarioPageProps) {
  const meta = INVENTARIO_VISTA_META[vista];
  const { notifyApiError, notifySuccess } = useCrudUi();
  const { tienePermiso } = usePermissions();
  const listFilter = useCrudEmpresaFilterCard();
  const empresaIdParam = listFilter.empresaIdParam;
  const [dashboard, setDashboard] = useState<InventarioDashboardResumen | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(vista === 'dashboard');
  const [chartBodegaId, setChartBodegaId] = useState('');
  const [dashboardBodegas, setDashboardBodegas] = useState<Bodega[]>([]);

  const stockTable = usePaginatedCrudTable<StockZonaItem>({
    empresaFilterId: empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarStockInventario({ ...params, porPagina: params.porPagina ?? 20 });
      return { total: res.total, items: res.stock };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar stock'),
  });

  const movTable = usePaginatedCrudTable<MovimientoInventarioItem>({
    empresaFilterId: empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarMovimientosInventario({
        ...params,
        porPagina: params.porPagina ?? 20,
      });
      return { total: res.total, items: res.movimientos };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar movimientos'),
  });

  const [exporting, setExporting] = useState<InventarioExportFormat | null>(null);

  const buildExportParams = (table: { sortKey?: string; sortDirection?: 'asc' | 'desc' }) => ({
    empresaId: empresaIdParam,
    ...(table.sortKey
      ? { ordenarPor: table.sortKey, orden: table.sortDirection ?? ('asc' as const) }
      : {}),
  });

  async function handleExportStock(formato: InventarioExportFormat) {
    setExporting(formato);
    try {
      await exportarStockInventario(formato, buildExportParams(stockTable));
      notifySuccess(
        formato === 'xlsx' ? 'Reporte Excel descargado' : 'Reporte PDF descargado',
      );
    } catch (err) {
      notifyApiError(err, 'No se pudo exportar el stock');
    } finally {
      setExporting(null);
    }
  }

  async function handleExportMovimientos(formato: InventarioExportFormat) {
    setExporting(formato);
    try {
      await exportarMovimientosInventario(formato, buildExportParams(movTable));
      notifySuccess(
        formato === 'xlsx' ? 'Reporte Excel descargado' : 'Reporte PDF descargado',
      );
    } catch (err) {
      notifyApiError(err, 'No se pudo exportar movimientos');
    } finally {
      setExporting(null);
    }
  }

  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [zonas, setZonas] = useState<ZonaBodega[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    if (vista !== 'dashboard') return;
    setChartBodegaId('');
  }, [vista, empresaIdParam]);

  useEffect(() => {
    if (vista !== 'dashboard') return;
    let cancelled = false;
    listarBodegas({
      pagina: 1,
      porPagina: 500,
      ...(empresaIdParam != null ? { empresaId: empresaIdParam } : {}),
    })
      .then((res) => {
        if (!cancelled) setDashboardBodegas(res.bodegas);
      })
      .catch(() => {
        if (!cancelled) setDashboardBodegas([]);
      });
    return () => {
      cancelled = true;
    };
  }, [vista, empresaIdParam]);

  useEffect(() => {
    if (vista !== 'dashboard') return;
    let cancelled = false;
    setDashboardLoading(true);
    obtenerDashboardInventario({
      empresaId: empresaIdParam,
      bodegaId: chartBodegaId ? Number(chartBodegaId) : undefined,
    })
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) {
          notifyApiError(err, 'Error al cargar el dashboard');
          setDashboard(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDashboardLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vista, empresaIdParam, chartBodegaId, notifyApiError]);

  useEffect(() => {
    if (!needsMaestros(vista)) return;
    let cancelled = false;
    const listParams = {
      pagina: 1,
      porPagina: 500,
      ...(empresaIdParam != null ? { empresaId: empresaIdParam } : {}),
    };
    Promise.all([listarBodegas(listParams), listarProductos(listParams)])
      .then(([bRes, pRes]) => {
        if (!cancelled) {
          setBodegas(bRes.bodegas);
          setProductos(pRes.productos);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          notifyApiError(err, 'Error al cargar datos');
          setBodegas([]);
          setProductos([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [vista, empresaIdParam, notifyApiError]);

  const [opBodega, setOpBodega] = useState('');
  const [zonaOrigen, setZonaOrigen] = useState('');
  const [zonaDestino, setZonaDestino] = useState('');

  useEffect(() => {
    if (!OP_VISTAS.includes(vista) || !opBodega) {
      setZonas([]);
      return;
    }
    let cancelled = false;
    listarZonasBodega({
      pagina: 1,
      porPagina: 500,
      extra: { bodega_id: opBodega },
      ...(empresaIdParam != null ? { empresaId: empresaIdParam } : {}),
    })
      .then((res) => {
        if (!cancelled) setZonas(res.zonas_bodega);
      })
      .catch((err) => {
        if (!cancelled) {
          notifyApiError(err, 'Error al cargar zonas');
          setZonas([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [vista, opBodega, empresaIdParam, notifyApiError]);

  const [cfgBodega, setCfgBodega] = useState('');
  const [cfgZona, setCfgZona] = useState('');
  const [cfgZonas, setCfgZonas] = useState<ZonaBodega[]>([]);

  useEffect(() => {
    if (vista !== 'configuracion' || !cfgBodega) {
      if (vista === 'configuracion') {
        setCfgZonas([]);
        setCfgZona('');
      }
      return;
    }
    let cancelled = false;
    listarZonasBodega({
      pagina: 1,
      porPagina: 500,
      extra: { bodega_id: cfgBodega },
      ...(empresaIdParam != null ? { empresaId: empresaIdParam } : {}),
    })
      .then((res) => {
        if (!cancelled) setCfgZonas(res.zonas_bodega);
      })
      .catch(() => {
        if (!cancelled) setCfgZonas([]);
      });
    obtenerConfigInventarioBodega(Number(cfgBodega), empresaIdParam ?? undefined)
      .then((c) => {
        if (!cancelled) {
          setCfgZona(c.zona_recepcion_default_id ? String(c.zona_recepcion_default_id) : '');
        }
      })
      .catch(() => {
        if (!cancelled) setCfgZona('');
      });
    return () => {
      cancelled = true;
    };
  }, [vista, cfgBodega, empresaIdParam]);

  const guardarConfig = async () => {
    if (!cfgBodega) return;
    try {
      await actualizarConfigInventarioBodega(
        Number(cfgBodega),
        cfgZona ? Number(cfgZona) : null,
        empresaIdParam ?? undefined,
      );
      notifySuccess('Zona de recepción configurada');
    } catch (err) {
      notifyApiError(err, 'Error al guardar configuración');
    }
  };

  const stockColumns = [
    {
      key: 'bodega',
      header: 'Bodega',
      sortable: true,
      render: (r: StockZonaItem) => r.bodega_nombre ?? '—',
    },
    { key: 'zona', header: 'Ubicación', sortable: true, render: (r: StockZonaItem) => r.zona_nombre },
    { key: 'sku', header: 'SKU', sortable: true, render: (r: StockZonaItem) => r.producto_sku },
    {
      key: 'producto',
      header: 'Producto',
      sortable: true,
      render: (r: StockZonaItem) => r.producto_nombre,
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      sortable: true,
      align: 'right' as const,
      render: (r: StockZonaItem) =>
        `${r.cantidad} ${r.unidad_medida_nombre ?? ''}`.trim(),
    },
  ];

  const movColumns = [
    {
      key: 'fecha',
      header: 'Fecha',
      sortable: true,
      render: (r: { creado_at?: string | null }) => r.creado_at?.slice(0, 19) ?? '—',
    },
    { key: 'tipo', header: 'Tipo', sortable: true, render: (r: { tipo: string }) => r.tipo },
    {
      key: 'producto',
      header: 'Producto',
      sortable: true,
      render: (r: { producto_nombre?: string | null; producto_sku?: string | null }) =>
        `${r.producto_sku ?? ''} ${r.producto_nombre ?? ''}`.trim(),
    },
    {
      key: 'cantidad',
      header: 'Cant.',
      sortable: true,
      align: 'right' as const,
      render: (r: { cantidad: number }) => r.cantidad,
    },
    { key: 'origen', header: 'Origen', render: (r: { zona_origen_nombre?: string | null }) => r.zona_origen_nombre ?? '—' },
    { key: 'destino', header: 'Destino', render: (r: { zona_destino_nombre?: string | null }) => r.zona_destino_nombre ?? '—' },
    { key: 'usuario', header: 'Usuario', render: (r: { usuario_email?: string | null }) => r.usuario_email ?? '—' },
  ];

  const selectClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

  return (
    <PageLayout
      routes={[
        { text: 'Inventario operativo' },
        { text: meta.section },
        { text: meta.title },
      ]}
      icon={vista === 'dashboard' ? 'home' : 'table'}
    >
      <CrudEmpresaFilterCard filter={listFilter} className="mb-4" />
      <InventarioOperativoNav active={vista} />

      {vista === 'dashboard' && (
        <>
          {dashboardLoading ? (
            <Text variant="body-regular" className={colorClass.muted}>
              Cargando indicadores…
            </Text>
          ) : dashboard ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: 'Líneas de stock', value: dashboard.lineas_stock },
                  { label: 'Productos con stock', value: dashboard.productos_con_stock },
                  { label: 'Ubicaciones', value: dashboard.ubicaciones_con_stock },
                  { label: 'Movimientos hoy', value: dashboard.movimientos_hoy },
                  { label: 'Mov. últimos 7 días', value: dashboard.movimientos_semana },
                ].map((kpi) => (
                  <Card key={kpi.label} elevation={1} padding="16px">
                    <Text variant="header-6" className={colorClass.brand}>
                      {kpi.value}
                    </Text>
                    <Text variant="small-regular" className={colorClass.muted}>
                      {kpi.label}
                    </Text>
                  </Card>
                ))}
              </div>

              {dashboard.histograma_movimientos && dashboard.stock_distribucion && (
                <InventarioDashboardCharts
                  histograma={dashboard.histograma_movimientos}
                  stockDistribucion={dashboard.stock_distribucion}
                  bodegas={dashboardBodegas}
                  chartBodegaId={chartBodegaId}
                  onChartBodegaChange={setChartBodegaId}
                  selectClass={selectClass}
                />
              )}

              <Card elevation={1} padding="20px">
                <Text variant="body-medium" className={colorClass.brandLight}>
                  Accesos rápidos
                </Text>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INVENTARIO_NAV_ITEMS.filter(
                    (item) => item.vista !== 'dashboard' && tienePermiso(item.permission),
                  ).map((item) => (
                    <Link key={item.vista} to={item.path}>
                      <PrimaryButton type="button" variant="outline">
                        {item.label}
                      </PrimaryButton>
                    </Link>
                  ))}
                </div>
              </Card>

              <Card elevation={1} padding="20px">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Text variant="body-medium" className={colorClass.brandLight}>
                    Últimos movimientos
                  </Text>
                  {tienePermiso('inventario.leer') && (
                    <Link to={INVENTARIO_ROUTE_PATHS.movimientos}>
                      <PrimaryButton type="button" variant="outline">
                        Ver historial
                      </PrimaryButton>
                    </Link>
                  )}
                </div>
                <Table
                  columns={movColumns}
                  data={dashboard.ultimos_movimientos}
                  totalRows={dashboard.ultimos_movimientos.length}
                  searchable={false}
                  emptyMessage="Sin movimientos recientes"
                />
              </Card>
            </div>
          ) : null}
        </>
      )}

      {vista === 'stock' && (
        <>
          <div className="mb-3 flex flex-wrap justify-end gap-2">
            <PrimaryButton
              type="button"
              variant="outline"
              isLoading={exporting === 'xlsx'}
              disabled={exporting !== null}
              onClick={() => void handleExportStock('xlsx')}
            >
              Exportar Excel
            </PrimaryButton>
            <PrimaryButton
              type="button"
              variant="outline"
              isLoading={exporting === 'pdf'}
              disabled={exporting !== null}
              onClick={() => void handleExportStock('pdf')}
            >
              Exportar PDF
            </PrimaryButton>
            <PrimaryButton
              type="button"
              isLoading={stockTable.loading}
              disabled={exporting !== null}
              onClick={() => void stockTable.reload()}
            >
              Actualizar inventario
            </PrimaryButton>
          </div>
          <Card>
            <Table
              columns={stockColumns}
              data={stockTable.items}
              totalRows={stockTable.total}
              isLoading={stockTable.loading}
              pagination={stockTable.pagination}
              emptyMessage="Sin stock registrado"
              {...stockTable.sortProps}
            />
          </Card>
        </>
      )}

      {vista === 'movimientos' && (
        <>
          <div className="mb-3 flex flex-wrap justify-end gap-2">
            <PrimaryButton
              type="button"
              variant="outline"
              isLoading={exporting === 'xlsx'}
              disabled={exporting !== null}
              onClick={() => void handleExportMovimientos('xlsx')}
            >
              Exportar Excel
            </PrimaryButton>
            <PrimaryButton
              type="button"
              variant="outline"
              isLoading={exporting === 'pdf'}
              disabled={exporting !== null}
              onClick={() => void handleExportMovimientos('pdf')}
            >
              Exportar PDF
            </PrimaryButton>
          </div>
        <Card>
          <Table
            columns={movColumns}
            data={movTable.items}
            totalRows={movTable.total}
            isLoading={movTable.loading}
            pagination={movTable.pagination}
            emptyMessage="Sin movimientos"
            {...movTable.sortProps}
          />
        </Card>
        </>
      )}

      {(vista === 'recepcion' || vista === 'traslado' || vista === 'despacho') && (
        <InventarioOperacionEscaneo
          vista={vista}
          titulo={meta.title}
          bodegas={bodegas}
          zonas={zonas}
          productos={productos}
          empresaIdParam={empresaIdParam ?? undefined}
          opBodega={opBodega}
          onOpBodegaChange={setOpBodega}
          zonaOrigen={zonaOrigen}
          onZonaOrigenChange={setZonaOrigen}
          zonaDestino={zonaDestino}
          onZonaDestinoChange={setZonaDestino}
        />
      )}

      {vista === 'configuracion' && (
        <Card className="flex max-w-md flex-col gap-3 p-4">
          <label className="text-sm font-medium">Bodega</label>
          <select className={selectClass} value={cfgBodega} onChange={(e) => setCfgBodega(e.target.value)}>
            <option value="">Seleccione…</option>
            {bodegas.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
          <label className="text-sm font-medium">Zona de recepción por defecto</label>
          <select className={selectClass} value={cfgZona} onChange={(e) => setCfgZona(e.target.value)}>
            <option value="">Sin configurar</option>
            {cfgZonas.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nombre || z.tipo_zona_nombre}
              </option>
            ))}
          </select>
          <PrimaryButton type="button" onClick={guardarConfig}>
            Guardar
          </PrimaryButton>
        </Card>
      )}
    </PageLayout>
  );
}

/** Redirige /inventario al primer destino con permiso (stock por defecto). */
export function InventarioIndexRedirect() {
  return <Navigate to={appPath('/inventario/dashboard')} replace />;
}
