import { useState, type FormEvent } from 'react';
import { crearUnidadMedida, eliminarUnidadMedida, listarUnidadesMedida } from '@/api/unidadesMedida';
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
import type { UnidadMedida } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function UnidadesMedidaPage() {
  const { notifySuccess, notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const empresaFilter = useEmpresaMaestraFilter();
  const table = usePaginatedCrudTable<UnidadMedida>({
    empresaFilterId: empresaFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarUnidadesMedida(params);
      return { total: res.total, items: res.productos ?? [] };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar unidades de medida'),
  });
  const [showForm, setShowForm] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearUnidadMedida({ codigo: codigo.trim(), nombre: nombre.trim(), activo: 1 });
      setCodigo('');
      setNombre('');
      setShowForm(false);
      notifySuccess('Unidad de medida creada correctamente');
      await table.reload();
    } catch (err) {
      notifyApiError(err, 'Error al crear unidad de medida');
    } finally {
      setSubmitting(false);
    }
  }

  const tableActions = createCrudTableActions<UnidadMedida>({
    onEdit: (row) => {
      openSidePanel({
        component: 'UnidadMedidaEditPanel',
        title: 'Editar unidad de medida',
        props: { unidad: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar unidad de medida',
        bodyText: `¿Confirma eliminar la unidad "${row.nombre}"?`,
        successMessage: 'Unidad de medida eliminada',
        onConfirm: async () => {
          await eliminarUnidadMedida(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Unidades de medida' }]}
      icon="layers"
      supportingText={`${table.total} registradas`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Nueva unidad'}
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
          <FormLayout.Section title="Datos de la unidad">
            <LabelInput id="codigo" label="Código" value={codigo} onChange={setCodigo} required placeholder="KG" />
            <LabelInput id="nombre" label="Nombre" value={nombre} onChange={setNombre} required placeholder="Kilogramo" />
          </FormLayout.Section>
          <FormLayout.Footer
            primaryButton={
              <PrimaryButton type="submit" colorVariant="success" isLoading={submitting}>
                Guardar unidad
              </PrimaryButton>
            }
          />
        </FormLayout>
      )}

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'codigo', header: 'Código', render: (row) => <code>{row.codigo}</code> },
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
        searchPlaceholder="Buscar unidad de medida..."
        serverSideSort
        emptyMessage="No hay unidades de medida."
        actions={tableActions}
      />
    </PageLayout>
  );
}
