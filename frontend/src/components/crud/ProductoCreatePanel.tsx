import { useEffect, useState, type FormEvent } from 'react';
import { crearProducto } from '@/api/productos';
import { listarTiposProducto } from '@/api/tiposProducto';
import { listarUnidadesMedida } from '@/api/unidadesMedida';
import { EmpresaCreateSelector } from '@/components/crud/EmpresaCreateSelector';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { useEmpresaMaestraCreateForm } from '@/crud/useEmpresaMaestraCreateForm';
import type { TipoProducto, UnidadMedida } from '@/types/api';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface ProductoCreatePanelProps {
  onSaved?: () => void;
}

export function ProductoCreatePanel({ onSaved }: ProductoCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const empresaCreate = useEmpresaMaestraCreateForm();
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [tipos, setTipos] = useState<TipoProducto[]>([]);
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [unidadMedidaId, setUnidadMedidaId] = useState('');
  const [tipoProductoId, setTipoProductoId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const params = {
      pagina: 1,
      porPagina: 500,
      ...(empresaCreate.empresaIdNumber != null ? { empresaId: empresaCreate.empresaIdNumber } : {}),
    };
    Promise.all([listarUnidadesMedida(params), listarTiposProducto(params)])
      .then(([uniRes, tiposRes]) => {
        if (cancelled) return;
        const items = uniRes.productos ?? [];
        setUnidades(items);
        setTipos(tiposRes.tipos_producto);
        setUnidadMedidaId((prev) =>
          prev && items.some((u) => String(u.id) === prev) ? prev : items.length ? String(items[0].id) : '',
        );
      })
      .catch(() => {
        if (!cancelled) {
          setUnidades([]);
          setTipos([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [empresaCreate.empresaIdNumber]);

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
    setSubmitting(true);
    try {
      await crearProducto({
        nombre: nombre.trim(),
        sku: sku.trim(),
        activo: 1,
        unidad_medida_id: Number(unidadMedidaId),
        ...(tipoProductoId ? { tipo_producto_id: Number(tipoProductoId) } : {}),
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
    } finally {
      setSubmitting(false);
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
      <Selector
        id="create-tipo"
        label="Tipo de producto"
        options={tipoOptions}
        value={tipoProductoId}
        onChange={(v) => setTipoProductoId(String(v))}
        searchable
      />
      <Selector
        id="create-unidad"
        label="Unidad base de stock"
        options={unidadOptions.length ? unidadOptions : [{ label: 'Sin unidades', value: '' }]}
        value={unidadMedidaId}
        onChange={(v) => setUnidadMedidaId(String(v))}
      />
      <p className="text-xs text-neutral-500 -mt-2">
        El inventario se controlará en esta unidad. Los precios van en cada presentación.
      </p>
      <CrudPanelFooter
        submitting={submitting}
        disabled={!empresaCreate.isValid || !unidades.length}
        submitLabel="Guardar producto"
      />
    </form>
  );
}
