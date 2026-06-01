import { useState, type FormEvent } from 'react';
import { crearPermiso, listarPermisos } from '@/api/permisos';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { EmpresaMaestraFilter } from '@/components/crud/EmpresaMaestraFilter';
import { useCrudUi } from '@/crud/useCrudUi';
import { useEmpresaMaestraFilter } from '@/crud/useEmpresaMaestraFilter';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Permiso } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function PermisosPage() {
  const { notifySuccess, notifyApiError } = useCrudUi();
  const empresaFilter = useEmpresaMaestraFilter();
  const table = usePaginatedCrudTable<Permiso>({
    empresaFilterId: empresaFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarPermisos(params);
      return { total: res.total, items: res.permisos };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar permisos'),
  });
  const [showForm, setShowForm] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearPermiso({ codigo: codigo.trim(), descripcion: descripcion.trim() || null });
      setCodigo('');
      setDescripcion('');
      setShowForm(false);
      notifySuccess('Permiso creado correctamente');
      await table.reload();
    } catch (err) {
      notifyApiError(err, 'Error al crear permiso');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Permisos' }]}
      icon="lock"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Nuevo permiso'}
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
          <FormLayout.Section title="Datos del permiso">
            <LabelInput id="codigo" label="Código" value={codigo} onChange={setCodigo} required placeholder="inventario.ver" />
            <LabelInput id="descripcion" label="Descripción" value={descripcion} onChange={setDescripcion} />
          </FormLayout.Section>
          <FormLayout.Footer
            primaryButton={
              <PrimaryButton type="submit" colorVariant="success" isLoading={submitting}>
                Guardar permiso
              </PrimaryButton>
            }
          />
        </FormLayout>
      )}

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'codigo', header: 'Código', sortable: true, render: (row) => <code>{row.codigo}</code> },
          { key: 'descripcion', header: 'Descripción', render: (row) => row.descripcion ?? '—' },
          ...(empresaFilter.showFilter
            ? [{ key: 'empresa_id' as const, header: 'Empresa', render: (row: Permiso) => displayEmpresa(row) }]
            : []),
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar permiso..."
        serverSideSort
        emptyMessage="No hay permisos."
      />
    </PageLayout>
  );
}
