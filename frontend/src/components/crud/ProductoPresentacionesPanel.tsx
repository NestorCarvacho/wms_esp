import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  crearProductoPresentacion,
  eliminarProductoPresentacion,
  listarProductoPresentaciones,
} from '@/api/productoPresentaciones';
import { listarUnidadesMedida } from '@/api/unidadesMedida';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Producto, ProductoPresentacion, UnidadMedida } from '@/types/api';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface ProductoPresentacionesPanelProps {
  producto: Producto;
  onSaved?: () => void;
}

export function ProductoPresentacionesPanel({ producto, onSaved }: ProductoPresentacionesPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [presentaciones, setPresentaciones] = useState<ProductoPresentacion[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidadId, setUnidadId] = useState('');
  const [precioCosto, setPrecioCosto] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [ventaUnidad, setVentaUnidad] = useState(true);
  const [ventaPresentacion, setVentaPresentacion] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const empresaId = producto.empresa_id;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [presRes, uniRes] = await Promise.all([
        listarProductoPresentaciones(producto.id, {
          pagina: 1,
          porPagina: 100,
          ...(empresaId != null ? { empresaId } : {}),
        }),
        listarUnidadesMedida({
          pagina: 1,
          porPagina: 500,
          ...(empresaId != null ? { empresaId } : {}),
        }),
      ]);
      setPresentaciones(presRes.presentaciones);
      const items = uniRes.productos ?? [];
      setUnidades(items);
      setUnidadId((prev) =>
        prev && items.some((u) => String(u.id) === prev) ? prev : items.length ? String(items[0].id) : '',
      );
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al cargar presentaciones',
      });
    } finally {
      setLoading(false);
    }
  }, [producto.id, empresaId, showNotification]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const unidadOptions = unidades.map((u) => ({
    label: `${u.nombre}${u.codigo ? ` (${u.codigo})` : ''}`,
    value: String(u.id),
  }));

  function resetForm() {
    setNombre('');
    setCantidad('');
    setPrecioCosto('');
    setPrecioVenta('');
    setVentaUnidad(true);
    setVentaPresentacion(true);
    setShowForm(false);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearProductoPresentacion(producto.id, {
        nombre: nombre.trim(),
        cantidad_contenida: Number(cantidad),
        unidad_medida_id: Number(unidadId),
        precio_costo: precioCosto ? Number(precioCosto) : null,
        precio_venta: precioVenta ? Number(precioVenta) : null,
        permite_venta_unidad: ventaUnidad ? 1 : 0,
        permite_venta_presentacion: ventaPresentacion ? 1 : 0,
      });
      showNotification({ type: 'success', message: 'Presentación creada' });
      resetForm();
      await loadData();
      onSaved?.();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear presentación',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(p: ProductoPresentacion) {
    if (!window.confirm(`¿Eliminar la presentación "${p.nombre}"?`)) return;
    try {
      await eliminarProductoPresentacion(p.id);
      showNotification({ type: 'success', message: 'Presentación eliminada' });
      await loadData();
      onSaved?.();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al eliminar',
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-600">
        Producto: <strong>{producto.nombre}</strong>
        {producto.unidad_medida_nombre && (
          <> · Stock en unidad base: <strong>{producto.unidad_medida_nombre}</strong></>
        )}
      </p>

      {loading && <p className="text-sm text-neutral-500">Cargando…</p>}

      {!loading && presentaciones.length === 0 && !showForm && (
        <p className="text-sm text-neutral-500">Sin presentaciones. Agrega cajas, packs u otros empaques.</p>
      )}

      {!loading && presentaciones.length > 0 && (
        <ul className="flex flex-col gap-2">
          {presentaciones.map((p) => (
            <li key={p.id} className="border rounded-lg p-3 text-sm">
              <div className="font-medium">{p.nombre}</div>
              <div className="text-neutral-600 mt-1">
                Contiene {p.cantidad_contenida} {p.unidad_medida_nombre ?? 'unidades'}
              </div>
              <div className="text-neutral-600">
                Venta unidad: {p.permite_venta_unidad ? 'Sí' : 'No'} · Venta empaque:{' '}
                {p.permite_venta_presentacion ? 'Sí' : 'No'}
              </div>
              {(p.precio_costo != null || p.precio_venta != null) && (
                <div className="text-neutral-600">
                  {p.precio_costo != null && <>Costo: {p.precio_costo} </>}
                  {p.precio_venta != null && <>· Venta: {p.precio_venta}</>}
                </div>
              )}
              <PrimaryButton
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => void handleDelete(p)}
              >
                Eliminar
              </PrimaryButton>
            </li>
          ))}
        </ul>
      )}

      {!showForm ? (
        <PrimaryButton type="button" onClick={() => setShowForm(true)} disabled={!unidades.length}>
          Nueva presentación
        </PrimaryButton>
      ) : (
        <form onSubmit={handleCreate} className="flex flex-col gap-3 border-t pt-4">
          <LabelInput id="pres-nombre" label="Nombre" value={nombre} onChange={setNombre} required placeholder="Caja 100 unidades" />
          <LabelInput
            id="pres-cantidad"
            label="Cantidad contenida"
            type="number"
            value={cantidad}
            onChange={setCantidad}
            required
          />
          <ComboBox
            id="pres-unidad"
            label="Unidad del contenido"
            options={unidadOptions.length ? unidadOptions : [{ label: 'Sin unidades', value: '' }]}
            value={unidadId}
            onChange={(v) => setUnidadId(String(v))}
          />
          <LabelInput id="pres-costo" label="Precio costo" type="number" value={precioCosto} onChange={setPrecioCosto} />
          <LabelInput id="pres-venta" label="Precio venta" type="number" value={precioVenta} onChange={setPrecioVenta} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={ventaUnidad} onChange={(e) => setVentaUnidad(e.target.checked)} />
            Permite venta por unidad
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={ventaPresentacion} onChange={(e) => setVentaPresentacion(e.target.checked)} />
            Permite venta por empaque completo
          </label>
          <CrudPanelFooter submitting={submitting} disabled={!unidades.length} submitLabel="Guardar presentación" />
          <PrimaryButton type="button" variant="outline" onClick={resetForm}>
            Cancelar
          </PrimaryButton>
        </form>
      )}

      <PrimaryButton type="button" variant="outline" onClick={closeSidePanel}>
        Cerrar
      </PrimaryButton>
    </div>
  );
}
