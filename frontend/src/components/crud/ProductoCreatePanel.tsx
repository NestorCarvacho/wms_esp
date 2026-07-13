import { useEffect, useState, type FormEvent } from 'react';
import { EmpresaCreateSelector } from '@/components/crud/EmpresaCreateSelector';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { useEmpresaMaestraCreateForm } from '@/crud/useEmpresaMaestraCreateForm';
import { useProductoCatalogOptions } from '@/features/producto/hooks/useProductoCatalogOptions';
import { useProductoMutations } from '@/features/producto/hooks/useProductoMutations';
import { readStockMinimoInput } from '@/features/producto/lib/stockMinimo';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface ProductoCreatePanelProps {
  onSaved?: () => void;
}

export function ProductoCreatePanel({ onSaved }: ProductoCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const empresaCreate = useEmpresaMaestraCreateForm();
  const { unidades, tipos } = useProductoCatalogOptions({
    empresaId: empresaCreate.empresaIdNumber ?? undefined,
  });
  const { crear } = useProductoMutations();

  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [unidadMedidaId, setUnidadMedidaId] = useState('');
  const [tipoProductoId, setTipoProductoId] = useState('');
  const [serializado, setSerializado] = useState(false);
  const [stockMinimo, setStockMinimo] = useState('');

  useEffect(() => {
    setUnidadMedidaId((prev) =>
      prev && unidades.some((u) => String(u.id) === prev)
        ? prev
        : unidades.length
          ? String(unidades[0].id)
          : '',
    );
  }, [unidades]);

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
    const stockMinimoResult = readStockMinimoInput(stockMinimo);
    if (!stockMinimoResult.ok) {
      showNotification({ type: 'error', message: stockMinimoResult.error });
      return;
    }
    try {
      await crear.mutateAsync({
        nombre: nombre.trim(),
        sku: sku.trim(),
        activo: 1,
        unidad_medida_id: Number(unidadMedidaId),
        serializado,
        ...(tipoProductoId ? { tipo_producto_id: Number(tipoProductoId) } : {}),
        ...(stockMinimoResult.value != null ? { stock_minimo: stockMinimoResult.value } : {}),
        ...(empresaCreate.empresaIdNumber != null ? { empresa_id: empresaCreate.empresaIdNumber } : {}),
      });
      showNotification({ type: 'success', message: 'Producto creado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear producto',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <EmpresaCreateSelector
        show={empresaCreate.showEmpresaField}
        value={empresaCreate.empresaId}
        onChange={empresaCreate.setEmpresaId}
        options={empresaCreate.empresaOptions}
        loading={empresaCreate.loading}
      />
      <LabelInput id="create-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
      <LabelInput id="create-sku" label="SKU" value={sku} onChange={setSku} required />
      <ComboBox
        id="create-tipo"
        label="Tipo de producto"
        options={tipoOptions}
        value={tipoProductoId}
        onChange={(v) => setTipoProductoId(String(v))}
        searchable
      />
      <ComboBox
        id="create-unidad"
        label="Unidad base de stock"
        options={unidadOptions.length ? unidadOptions : [{ label: 'Sin unidades', value: '' }]}
        value={unidadMedidaId}
        onChange={(v) => setUnidadMedidaId(String(v))}
      />
      <p className="text-xs text-neutral-500 -mt-2">
        El inventario se controlará en esta unidad. Los precios van en cada presentación.
      </p>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            id="create-serializado"
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

      <LabelInput
        id="create-stock-minimo"
        type="number"
        label="Stock mínimo (alerta)"
        value={stockMinimo}
        onChange={setStockMinimo}
        min={0}
        helperText="Opcional. Tras un despacho, se alerta si el stock en la zona origen queda en o bajo este valor."
      />

      <CrudPanelFooter
        submitting={crear.isPending}
        disabled={!empresaCreate.isValid || !unidades.length}
        submitLabel="Guardar producto"
      />
    </form>
  );
}
