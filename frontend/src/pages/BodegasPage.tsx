import { useState, type FormEvent } from 'react';
import { crearBodega, eliminarBodega, listarBodegas } from '@/api/bodegas';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { EmpresaMaestraFilter } from '@/components/crud/EmpresaMaestraFilter';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useEmpresaMaestraFilter } from '@/crud/useEmpresaMaestraFilter';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Bodega } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function BodegasPage() {
  const { notifySuccess, notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const empresaFilter = useEmpresaMaestraFilter();
  const table = usePaginatedCrudTable<Bodega>({
    empresaFilterId: empresaFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarBodegas(params);
      return { total: res.total, items: res.bodegas };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar bodegas'),
  });
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearBodega({ nombre: nombre.trim(), codigo: codigo.trim(), activo: 1 });
      setNombre('');
      setCodigo('');
      setShowForm(false);
      notifySuccess('Bodega creada correctamente');
      await table.reload();
    } catch (err) {
      notifyApiError(err, 'Error al crear bodega');
    } finally {
      setSubmitting(false);
    }
  }

  const tableActions = createCrudTableActions<Bodega>({
    onEdit: (row) => {
      openSidePanel({
        component: 'BodegaEditPanel',
        title: 'Editar bodega',
        props: { bodega: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar bodega',
        bodyText: `¿Confirma eliminar la bodega "${row.nombre}"?`,
        successMessage: 'Bodega eliminada',
        onConfirm: async () => {
          await eliminarBodega(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Bodegas' }]}
      icon="building"
      supportingText={`${table.total} registradas`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Nueva bodega'}
        </PrimaryButton>
      </div>

      <EmpresaMaestraFilter
        show={empresaFilter.showFilter}
        value={empresaFilter.empresaFilterId}
        onChange={empresaFilter.setEmpresaFilterId}
        options={empresaFilter.filterOptions}
        loading={empresaFilter.loading}
      />

      {showForm && (
        <FormLayout onSubmit={handleCreate} columns={2} className="mb-6">
          <FormLayout.Section title="Datos de la bodega">
            <LabelInput id="nombre" label="Nombre" value={nombre} onChange={setNombre} required />
            <LabelInput id="codigo" label="Código" value={codigo} onChange={setCodigo} required />
          </FormLayout.Section>
          <FormLayout.Footer
            primaryButton={
              <PrimaryButton type="submit" colorVariant="success" isLoading={submitting}>
                Guardar bodega
              </PrimaryButton>
            }
          />
        </FormLayout>
      )}

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'codigo', header: 'Código', render: (row) => <code>{row.codigo}</code> },
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
        searchPlaceholder="Buscar bodega..."
        serverSideSort
        emptyMessage="No hay bodegas. Crea la primera."
        actions={tableActions}
      />
    </PageLayout>
  );
}
