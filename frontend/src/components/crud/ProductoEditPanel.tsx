import { useEffect, useState, type FormEvent } from 'react';
import { actualizarProducto } from '@/api/productos';
import { listarTiposProducto } from '@/api/tiposProducto';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Producto, TipoProducto, UnidadMedida } from '@/types/api';
import { preserveActivoNumber } from './preserveActivo';

export interface ProductoEditPanelProps {
  producto: Producto;
  unidades: UnidadMedida[];
  onSaved?: () => void;
}

export function ProductoEditPanel({ producto, unidades, onSaved }: ProductoEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [tipos, setTipos] = useState<TipoProducto[]>([]);
  const [nombre, setNombre] = useState(producto.nombre);
  const [sku, setSku] = useState(producto.sku);
  const [unidadMedidaId, setUnidadMedidaId] = useState(String(producto.unidad_medida_id ?? ''));
  const [tipoProductoId, setTipoProductoId] = useState(
    producto.tipo_producto_id != null ? String(producto.tipo_producto_id) : '',
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listarTiposProducto({
      pagina: 1,
      porPagina: 500,
      ...(producto.empresa_id != null ? { empresaId: producto.empresa_id } : {}),
    })
      .then((res) => setTipos(res.tipos_producto))
      .catch(() => setTipos([]));
  }, [producto.empresa_id]);

  const unidadOptions = unidades.map((u) => ({
    label: `${u.nombre}${u.codigo ? ` (${u.codigo})` : ''}`,
    value: String(u.id),
  }));

  const tipoOptions = [
    { label: 'Sin clasificación', value: '' },
    ...tipos.map((t) => ({ label: t.nombre, value: String(t.id) })),
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const unidadId = Number(unidadMedidaId);
    if (!unidadMedidaId || !Number.isFinite(unidadId) || unidadId <= 0) {
      showNotification({ type: 'error', message: 'Seleccione una unidad de medida válida' });
      return;
    }
    setSubmitting(true);
    try {
      await actualizarProducto(producto.id, {
        nombre: nombre.trim(),
        sku: sku.trim(),
        unidad_medida_id: unidadId,
        tipo_producto_id: tipoProductoId ? Number(tipoProductoId) : null,
        activo: preserveActivoNumber(producto.activo),
      });
      showNotification({ type: 'success', message: 'Producto actualizado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar producto',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="edit-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
      <LabelInput id="edit-sku" label="SKU" value={sku} onChange={setSku} required />
      <ComboBox
        id="edit-tipo"
        label="Tipo de producto"
        options={tipoOptions}
        value={tipoProductoId}
        onChange={(v) => setTipoProductoId(String(v))}
        searchable
      />
      <ComboBox
        id="edit-unidad"
        label="Unidad base de stock"
        options={unidadOptions.length ? unidadOptions : [{ label: 'Sin unidades', value: '' }]}
        value={unidadMedidaId}
        onChange={(v) => setUnidadMedidaId(String(v))}
      />
      <div className="flex gap-3 pt-2">
        <PrimaryButton type="button" variant="outline" onClick={closeSidePanel}>
          Cancelar
        </PrimaryButton>
        <PrimaryButton type="submit" colorVariant="success" isLoading={submitting} disabled={!unidades.length}>
          Guardar
        </PrimaryButton>
      </div>
    </form>
  );
}
