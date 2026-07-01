import { useState, type FormEvent } from 'react';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Producto, UnidadMedida } from '@/types/api';
import { useProductoCatalogOptions } from '@/features/producto/hooks/useProductoCatalogOptions';
import { useProductoMutations } from '@/features/producto/hooks/useProductoMutations';
import { preserveActivoNumber } from './preserveActivo';

export interface ProductoEditPanelProps {
  producto: Producto;
  unidades: UnidadMedida[];
  onSaved?: () => void;
}

export function ProductoEditPanel({ producto, unidades, onSaved }: ProductoEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const { tipos } = useProductoCatalogOptions({
    empresaId: producto.empresa_id ?? undefined,
  });
  const { actualizar } = useProductoMutations();

  const [nombre, setNombre] = useState(producto.nombre);
  const [sku, setSku] = useState(producto.sku);
  const [unidadMedidaId, setUnidadMedidaId] = useState(String(producto.unidad_medida_id ?? ''));
  const [tipoProductoId, setTipoProductoId] = useState(
    producto.tipo_producto_id != null ? String(producto.tipo_producto_id) : '',
  );
  const [serializado, setSerializado] = useState(producto.serializado ?? false);

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
    try {
      await actualizar.mutateAsync({
        id: producto.id,
        data: {
          nombre: nombre.trim(),
          sku: sku.trim(),
          unidad_medida_id: unidadId,
          tipo_producto_id: tipoProductoId ? Number(tipoProductoId) : null,
          activo: preserveActivoNumber(producto.activo),
          serializado,
        },
      });
      showNotification({ type: 'success', message: 'Producto actualizado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar producto',
      });
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
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            id="edit-serializado"
            type="checkbox"
            className="sr-only"
            checked={serializado}
            onChange={(e) => setSerializado(e.target.checked)}
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${serializado ? 'bg-blue-600' : 'bg-neutral-300'}`} />
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${serializado ? 'translate-x-4' : ''}`} />
        </div>
        <div>
          <span className="text-sm font-medium text-foreground">Inventario serializado</span>
          <p className="text-xs text-neutral-500">
            Actívalo si cada unidad tiene un número de serie único (laptops, equipos, etc.)
          </p>
        </div>
      </label>

      <div className="flex gap-3 pt-2">
        <PrimaryButton type="button" variant="outline" onClick={closeSidePanel}>
          Cancelar
        </PrimaryButton>
        <PrimaryButton type="submit" colorVariant="success" isLoading={actualizar.isPending} disabled={!unidades.length}>
          Guardar
        </PrimaryButton>
      </div>
    </form>
  );
}
