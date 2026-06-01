import { useState, type FormEvent } from 'react';
import { crearCargo, eliminarCargo, listarCargos } from '@/api/cargos';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { EmpresaMaestraFilter } from '@/components/crud/EmpresaMaestraFilter';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useEmpresaMaestraFilter } from '@/crud/useEmpresaMaestraFilter';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Cargo } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function CargosPage() {
  const { notifySuccess, notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const empresaFilter = useEmpresaMaestraFilter();
  const table = usePaginatedCrudTable<Cargo>({
    empresaFilterId: empresaFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarCargos(params);
      return { total: res.total, items: res.cargos };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar cargos'),
  });
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearCargo({ nombre: nombre.trim() });
      setNombre('');
      setShowForm(false);
      notifySuccess('Cargo creado correctamente');
      await table.reload();
    } catch (err) {
      notifyApiError(err, 'Error al crear cargo');
    } finally {
      setSubmitting(false);
    }
  }

  const tableActions = createCrudTableActions<Cargo>({
    onEdit: (row) => {
      openSidePanel({
        component: 'CargoEditPanel',
        title: 'Editar cargo',
        props: { cargo: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar cargo',
        bodyText: `¿Confirma eliminar el cargo "${row.nombre}"?`,
        successMessage: 'Cargo eliminado',
        onConfirm: async () => {
          await eliminarCargo(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Cargos' }]}
      icon="user"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Nuevo cargo'}
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
        <FormLayout onSubmit={handleCreate} columns={1} className="mb-6">
          <FormLayout.Section title="Datos del cargo">
            <LabelInput id="nombre" label="Nombre" value={nombre} onChange={setNombre} required />
          </FormLayout.Section>
          <FormLayout.Footer
            primaryButton={
              <PrimaryButton type="submit" colorVariant="success" isLoading={submitting}>
                Guardar cargo
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
          { key: 'empresa_id', header: 'Empresa', render: (row) => displayEmpresa(row) },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar cargo..."
        serverSideSort
        emptyMessage="No hay cargos."
        actions={tableActions}
      />
    </PageLayout>
  );
}
