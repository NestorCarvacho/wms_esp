import { useState, type FormEvent } from 'react';
import { actualizarProducto } from '@/api/productos';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Producto, UnidadMedida } from '@/types/api';
import { preserveActivoNumber } from './preserveActivo';

export interface ProductoEditPanelProps {
  producto: Producto;
  unidades: UnidadMedida[];
  onSaved?: () => void;
}

export function ProductoEditPanel({ producto, unidades, onSaved }: ProductoEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState(producto.nombre);
  const [sku, setSku] = useState(producto.sku);
  const [unidadMedidaId, setUnidadMedidaId] = useState(String(producto.unidad_medida_id ?? ''));
  const [precioCosto, setPrecioCosto] = useState(producto.precio_costo != null ? String(producto.precio_costo) : '');
  const [submitting, setSubmitting] = useState(false);

  const unidadOptions = unidades.map((u) => ({
    label: `${u.nombre}${u.codigo ? ` (${u.codigo})` : ''}`,
    value: String(u.id),
  }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarProducto(producto.id, {
        nombre: nombre.trim(),
        sku: sku.trim(),
        unidad_medida_id: Number(unidadMedidaId),
        precio_costo: precioCosto ? Number(precioCosto) : null,
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
      <Selector
        id="edit-unidad"
        label="Unidad de medida"
        options={unidadOptions.length ? unidadOptions : [{ label: 'Sin unidades', value: '' }]}
        value={unidadMedidaId}
        onChange={(v) => setUnidadMedidaId(String(v))}
      />
      <LabelInput
        id="edit-precio"
        label="Precio costo (opcional)"
        type="number"
        value={precioCosto}
        onChange={setPrecioCosto}
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
