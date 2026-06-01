import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { listarBodegas } from '@/api/bodegas';
import { listarTiposZona } from '@/api/tiposZona';
import { crearZonaBodega, eliminarZonaBodega, listarZonasBodega } from '@/api/zonasBodega';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { EmpresaMaestraFilter } from '@/components/crud/EmpresaMaestraFilter';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useEmpresaMaestraFilter } from '@/crud/useEmpresaMaestraFilter';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Bodega, TipoZona, ZonaBodega } from '@/types/api';
import { displayBodega, displayEmpresa, displayTipoZona } from '@/utils/displayLabels';

export function ZonasBodegaPage() {
  const { notifySuccess, notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const empresaFilter = useEmpresaMaestraFilter();
  const table = usePaginatedCrudTable<ZonaBodega>({
    empresaFilterId: empresaFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarZonasBodega(params);
      return { total: res.total, items: res.zonas_bodega };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar zonas de bodega'),
  });
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [tiposZona, setTiposZona] = useState<TipoZona[]>([]);
  const [formOptionsLoading, setFormOptionsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [bodegaId, setBodegaId] = useState('');
  const [tipoZonaId, setTipoZonaId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFormOptions = useCallback(async () => {
    setFormOptionsLoading(true);
    try {
      const listParams = {
        pagina: 1,
        porPagina: 500,
        ...(empresaFilter.empresaIdParam != null ? { empresaId: empresaFilter.empresaIdParam } : {}),
      };
      const [bodegasRes, tiposRes] = await Promise.all([
        listarBodegas(listParams),
        listarTiposZona(listParams),
      ]);
      setBodegas(bodegasRes.bodegas);
      setTiposZona(tiposRes.tipos_zona);
      setBodegaId((prev) => {
        if (prev && bodegasRes.bodegas.some((b) => String(b.id) === prev)) return prev;
        return bodegasRes.bodegas.length ? String(bodegasRes.bodegas[0].id) : '';
      });
      setTipoZonaId((prev) => {
        if (prev && tiposRes.tipos_zona.some((t) => String(t.id) === prev)) return prev;
        return tiposRes.tipos_zona.length ? String(tiposRes.tipos_zona[0].id) : '';
      });
    } catch (err) {
      notifyApiError(err, 'Error al cargar datos del formulario');
      setBodegas([]);
      setTiposZona([]);
      setBodegaId('');
      setTipoZonaId('');
    } finally {
      setFormOptionsLoading(false);
    }
  }, [empresaFilter.empresaIdParam, notifyApiError]);

  useEffect(() => {
    void loadFormOptions();
  }, [loadFormOptions]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!bodegaId || !tipoZonaId) {
      notifyApiError(new Error('Seleccione bodega y tipo de zona'), 'Datos incompletos');
      return;
    }
    setSubmitting(true);
    try {
      await crearZonaBodega({
        bodega_id: Number(bodegaId),
        tipo_zona_id: Number(tipoZonaId),
        nombre: nombre.trim() || null,
        activo: 1,
      });
      setNombre('');
      setShowForm(false);
      notifySuccess('Zona de bodega creada correctamente');
      await table.reload();
    } catch (err) {
      notifyApiError(err, 'Error al crear zona de bodega');
    } finally {
      setSubmitting(false);
    }
  }

  const tableActions = createCrudTableActions<ZonaBodega>({
    onEdit: (row) => {
      openSidePanel({
        component: 'ZonaBodegaEditPanel',
        title: 'Editar zona de bodega',
        props: { zona: row, bodegas, tiposZona, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      const label = row.nombre || displayBodega(row);
      confirmDelete({
        title: 'Eliminar zona de bodega',
        bodyText: `¿Confirma eliminar la zona "${label}"?`,
        successMessage: 'Zona eliminada',
        onConfirm: async () => {
          await eliminarZonaBodega(row.id);
          await table.reload();
        },
      });
    },
  });

  const bodegaOptions = bodegas.map((b) => ({
    label: `${b.nombre}${b.codigo ? ` (${b.codigo})` : ''}`,
    value: String(b.id),
  }));

  const tipoOptions = tiposZona.map((t) => ({
    label: t.nombre,
    value: String(t.id),
  }));

  const canCreate = bodegaOptions.length > 0 && tipoOptions.length > 0;

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Almacén' }, { text: 'Zonas de bodega' }]}
      icon="layers"
      supportingText={`${table.total} registradas`}
    >
      <EmpresaMaestraFilter
        show={empresaFilter.showFilter}
        value={empresaFilter.empresaFilterId}
        onChange={empresaFilter.setEmpresaFilterId}
        options={empresaFilter.filterOptions}
        loading={empresaFilter.loading}
      />

      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setShowForm((v) => !v)} disabled={!canCreate && !showForm}>
          {showForm ? 'Cancelar' : 'Nueva zona'}
        </PrimaryButton>
      </div>

      {!canCreate && !formOptionsLoading && (
        <p className="text-sm text-neutral-500 mb-4">
          Crea al menos una bodega y un tipo de zona antes de registrar zonas.
        </p>
      )}

      {showForm && (
        <FormLayout onSubmit={handleCreate} columns={2} className="mb-6">
          <FormLayout.Section title="Datos de la zona">
            <Selector
              id="bodega"
              label="Bodega"
              options={bodegaOptions.length ? bodegaOptions : [{ label: 'Sin bodegas', value: '' }]}
              value={bodegaId}
              onChange={(v) => setBodegaId(String(v))}
            />
            <Selector
              id="tipo-zona"
              label="Tipo de zona"
              options={tipoOptions.length ? tipoOptions : [{ label: 'Sin tipos', value: '' }]}
              value={tipoZonaId}
              onChange={(v) => setTipoZonaId(String(v))}
            />
            <LabelInput
              id="nombre"
              label="Nombre (opcional)"
              value={nombre}
              onChange={setNombre}
              placeholder="Ej. Pasillo A-1"
            />
          </FormLayout.Section>
          <FormLayout.Footer
            primaryButton={
              <PrimaryButton type="submit" colorVariant="success" isLoading={submitting} disabled={!canCreate}>
                Guardar zona
              </PrimaryButton>
            }
          />
        </FormLayout>
      )}

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          {
            key: 'nombre',
            header: 'Nombre',
            sortable: true,
            render: (row) => row.nombre || '—',
          },
          { key: 'bodega_id', header: 'Bodega', render: (row) => displayBodega(row) },
          { key: 'tipo_zona_id', header: 'Tipo', render: (row) => displayTipoZona(row) },
          {
            key: 'activo',
            header: 'Estado',
            render: (row) => <StatusPill active={row.activo ?? 1} />,
          },
          { key: 'empresa_id', header: 'Empresa', render: (row) => displayEmpresa(row) },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar zona de bodega..."
        serverSideSort
        emptyMessage="No hay zonas de bodega registradas."
        actions={tableActions}
      />
    </PageLayout>
  );
}
