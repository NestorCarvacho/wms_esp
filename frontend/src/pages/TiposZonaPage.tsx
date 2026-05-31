import { useState, type FormEvent } from 'react';
import { crearTipoZona, eliminarTipoZona, listarTiposZona } from '@/api/tiposZona';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { TipoZona } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function TiposZonaPage() {
  const { notifySuccess, notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const table = usePaginatedCrudTable<TipoZona>({
    fetchPage: async (params) => {
      const res = await listarTiposZona(params);
      return { total: res.total, items: res.tipos_zona };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar tipos de zona'),
  });
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearTipoZona({ nombre: nombre.trim() });
      setNombre('');
      setShowForm(false);
      notifySuccess('Tipo de zona creado correctamente');
      await table.reload();
    } catch (err) {
      notifyApiError(err, 'Error al crear tipo de zona');
    } finally {
      setSubmitting(false);
    }
  }

  const tableActions = createCrudTableActions<TipoZona>({
    onEdit: (row) => {
      openSidePanel({
        component: 'TipoZonaEditPanel',
        title: 'Editar tipo de zona',
        props: { tipoZona: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar tipo de zona',
        bodyText: `¿Confirma eliminar el tipo "${row.nombre}"?`,
        successMessage: 'Tipo de zona eliminado',
        onConfirm: async () => {
          await eliminarTipoZona(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Almacén' }, { text: 'Tipos de zona' }]}
      icon="layers"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Nuevo tipo de zona'}
        </PrimaryButton>
      </div>

      {showForm && (
        <FormLayout onSubmit={handleCreate} columns={1} className="mb-6">
          <FormLayout.Section title="Datos del tipo de zona">
            <LabelInput id="nombre" label="Nombre" value={nombre} onChange={setNombre} required />
          </FormLayout.Section>
          <FormLayout.Footer
            primaryButton={
              <PrimaryButton type="submit" colorVariant="success" isLoading={submitting}>
                Guardar tipo
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
        searchPlaceholder="Buscar tipo de zona..."
        serverSideSort
        emptyMessage="No hay tipos de zona. Crea el primero (ej. Picking, Recepción)."
        actions={tableActions}
      />
    </PageLayout>
  );
}
