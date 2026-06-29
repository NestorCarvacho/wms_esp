import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { consultarProducto } from '@/api/productos';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/cards/Card';
import { PrimaryButton } from '@/components/ui/buttons';
import { LabelInput } from '@/components/ui/inputs';
import { Text } from '@/components/ui/text/Text';
import { StatusPill } from '@/app/Feedback';
import { useCrudUi } from '@/crud/useCrudUi';
import { appPath } from '@/routes/paths';
import type { ProductoConsultaDetalle } from '@/types/api';

export function ConsultaProductoPage() {
  const navigate = useNavigate();
  const { notifyApiError } = useCrudUi();

  const [termino, setTermino] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [detalle, setDetalle] = useState<ProductoConsultaDetalle | null>(null);

  const ejecutarBusqueda = useCallback(
    async (codigo: string) => {
      const term = codigo.trim();
      if (!term) return;
      setBuscando(true);
      try {
        const res = await consultarProducto(term);
        setDetalle(res);
      } catch (err) {
        setDetalle(null);
        notifyApiError(err, 'Producto no encontrado');
      } finally {
        setBuscando(false);
      }
    },
    [notifyApiError],
  );

  const buscarOtro = () => {
    setDetalle(null);
    setTermino('');
    setTimeout(() => document.getElementById('consulta-codigo')?.focus(), 0);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void ejecutarBusqueda(termino);
  };

  const viaLabel =
    detalle?.via === 'codigo_barras' ? 'Código de barras' : 'SKU';

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Productos' }, { text: 'Consulta' }]}
      icon="search"
      supportingText="Busque por SKU o código de barras"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <PrimaryButton type="button" variant="outline" onClick={() => navigate(appPath('/productos'))}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Volver a productos
        </PrimaryButton>
        {detalle && (
          <PrimaryButton type="button" variant="outline" onClick={buscarOtro}>
            <Search className="mr-1.5 h-4 w-4" />
            Buscar otro
          </PrimaryButton>
        )}
      </div>

      <Card className="mb-4 max-w-xl p-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <LabelInput
              id="consulta-codigo"
              label="SKU o código de barras"
              value={termino}
              onChange={setTermino}
              placeholder="Ej: SKU001 o 7801111111111"
              autoFocus
            />
          </div>
          <PrimaryButton type="submit" isLoading={buscando} disabled={!termino.trim()}>
            Buscar
          </PrimaryButton>
        </form>
      </Card>

      {detalle && (
        <div className="flex flex-col gap-4 max-w-4xl">
          <Card className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <Text variant="header-4" as="h2">
                  {detalle.producto.nombre}
                </Text>
                <p className="text-sm text-muted-foreground mt-1">
                  Encontrado por {viaLabel}: <code className="text-foreground">{detalle.codigo_consultado}</code>
                </p>
              </div>
              <StatusPill active={detalle.producto.activo} />
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-medium"><code>{detalle.producto.sku}</code></dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Empresa</dt>
                <dd className="font-medium">{detalle.producto.empresa_nombre ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tipo</dt>
                <dd className="font-medium">{detalle.producto.tipo_producto_nombre ?? 'Sin clasificación'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Unidad base</dt>
                <dd className="font-medium">{detalle.producto.unidad_medida_nombre ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Inventario</dt>
                <dd className="font-medium">
                  {detalle.producto.serializado ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Serializado
                    </span>
                  ) : (
                    'Por cantidad'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Precio costo</dt>
                <dd className="font-medium">
                  {detalle.producto.precio_costo != null ? detalle.producto.precio_costo : '—'}
                </dd>
              </div>
            </dl>

            {detalle.presentacion_coincidente && (
              <div className="mt-4 rounded-md border border-blue-200 bg-blue-50/80 px-3 py-2 text-sm">
                <span className="font-medium text-blue-900">Presentación escaneada: </span>
                {detalle.presentacion_coincidente.nombre} · factor{' '}
                {detalle.presentacion_coincidente.cantidad_contenida}{' '}
                {detalle.producto.unidad_medida_nombre ?? 'UN'}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <Text variant="subheader-medium" className="mb-3">
              Presentaciones y códigos de barras
            </Text>
            {detalle.presentaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin presentaciones registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-3">Nombre</th>
                      <th className="py-2 pr-3">Código barras</th>
                      <th className="py-2 pr-3">Factor</th>
                      <th className="py-2">Precio venta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.presentaciones.map((p) => (
                      <tr key={p.id} className="border-b border-border/60">
                        <td className="py-2 pr-3">{p.nombre}</td>
                        <td className="py-2 pr-3">
                          <code>{p.codigo_barras ?? '—'}</code>
                        </td>
                        <td className="py-2 pr-3">{p.cantidad_contenida}</td>
                        <td className="py-2">{p.precio_venta ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <Text variant="subheader-medium" className="mb-3">
              Stock
            </Text>
            {detalle.producto.serializado ? (
              <>
                <p className="text-sm mb-2">
                  <span className="font-semibold">{detalle.series.total_en_bodega}</span> unidad(es) en bodega
                  (por número de serie)
                </p>
                {detalle.series.por_zona.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {detalle.series.por_zona.map((z) => (
                      <li key={String(z.zona_bodega_id)}>
                        {z.zona_nombre}: <strong>{z.cantidad}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin series en bodega.</p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm mb-2">
                  <span className="font-semibold">{detalle.stock.total_unidades_base}</span>{' '}
                  {detalle.producto.unidad_medida_nombre ?? 'unidades'} en total
                </p>
                {detalle.stock.por_zona.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {detalle.stock.por_zona.map((s) => (
                      <li key={s.zona_bodega_id}>
                        {s.bodega_nombre} · {s.zona_nombre}: <strong>{s.cantidad}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin stock registrado.</p>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
