import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  crearProducto,
  descargarPlantillaProductos,
  eliminarProducto,
  importarProductos,
  listarProductos,
} from '@/api/productos';
import { listarUnidadesMedida } from '@/api/unidadesMedida';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { Card } from '@/components/ui/cards/Card';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { Text } from '@/components/ui/text/Text';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Producto, ProductoImportacionResultado, UnidadMedida } from '@/types/api';
import { displayEmpresa, displayUnidadMedida } from '@/utils/displayLabels';

export function ProductosPage() {
  const { notifySuccess, notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const table = usePaginatedCrudTable<Producto>({
    fetchPage: async (params) => {
      const res = await listarProductos(params);
      return { total: res.total, items: res.productos };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar productos'),
  });
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [unidadMedidaId, setUnidadMedidaId] = useState('');
  const [precioCosto, setPrecioCosto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importResult, setImportResult] = useState<ProductoImportacionResultado | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    listarUnidadesMedida({ pagina: 1, porPagina: 500 })
      .then((res) => {
        if (cancelled) return;
        const items = res.productos ?? [];
        setUnidades(items);
        if (items.length) {
          setUnidadMedidaId(String(items[0].id));
        }
      })
      .catch((err) => {
        if (!cancelled) notifyApiError(err, 'Error al cargar unidades de medida');
      });
    return () => {
      cancelled = true;
    };
  }, [notifyApiError]);

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    try {
      await descargarPlantillaProductos();
      notifySuccess('Plantilla descargada');
    } catch (err) {
      notifyApiError(err, 'Error al descargar plantilla');
    } finally {
      setDownloadingTemplate(false);
    }
  }

  async function handleImportFile(file: File) {
    setImporting(true);
    setImportResult(null);
    try {
      const result = await importarProductos(file);
      setImportResult(result);
      if (result.creados > 0) {
        notifySuccess(`${result.creados} producto(s) importados`);
        await table.reload();
      } else if (result.con_errores > 0) {
        notifyApiError(new Error('Ninguna fila válida para importar'), 'Importación sin productos creados');
      }
    } catch (err) {
      notifyApiError(err, 'Error al importar productos');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      void handleImportFile(file);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearProducto({
        nombre: nombre.trim(),
        sku: sku.trim(),
        activo: 1,
        unidad_medida_id: Number(unidadMedidaId),
        precio_costo: precioCosto ? Number(precioCosto) : null,
      });
      setNombre('');
      setSku('');
      setPrecioCosto('');
      setShowForm(false);
      notifySuccess('Producto creado correctamente');
      await table.reload();
    } catch (err) {
      notifyApiError(err, 'Error al crear producto');
    } finally {
      setSubmitting(false);
    }
  }

  const tableActions = createCrudTableActions<Producto>({
    onEdit: (row) => {
      openSidePanel({
        component: 'ProductoEditPanel',
        title: 'Editar producto',
        props: { producto: row, unidades, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar producto',
        bodyText: `¿Confirma eliminar el producto "${row.nombre}"?`,
        successMessage: 'Producto eliminado',
        onConfirm: async () => {
          await eliminarProducto(row.id);
          await table.reload();
        },
      });
    },
  });

  const unidadOptions = unidades.map((u) => ({
    label: `${u.nombre}${u.codigo ? ` (${u.codigo})` : ''}`,
    value: String(u.id),
  }));

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Productos' }]}
      icon="table"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <PrimaryButton
          variant="outline"
          onClick={handleDownloadTemplate}
          isLoading={downloadingTemplate}
        >
          Descargar plantilla
        </PrimaryButton>
        <PrimaryButton
          variant="outline"
          isLoading={importing}
          onClick={() => fileInputRef.current?.click()}
        >
          Importar Excel
        </PrimaryButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xlsm"
          className="hidden"
          onChange={handleFileChange}
        />
        <PrimaryButton onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Nuevo producto'}
        </PrimaryButton>
      </div>

      {importResult && importResult.con_errores > 0 && (
        <Card elevation={1} padding="12px 16px" className="mb-4" backgroundColor="#FFF8E1">
          <Text variant="body-medium" color="#F57C00">
            {importResult.creados} creados · {importResult.con_errores} fila(s) con errores
          </Text>
          <ul className="mt-2 text-sm list-disc pl-5 space-y-1 text-neutral-700">
            {importResult.errores.slice(0, 15).map((err) => (
              <li key={err.fila}>
                Fila {err.fila}
                {err.sku ? ` (${err.sku})` : ''}: {err.errores.join('; ')}
              </li>
            ))}
            {importResult.errores.length > 15 && (
              <li>… y {importResult.errores.length - 15} error(es) más</li>
            )}
          </ul>
        </Card>
      )}

      {showForm && (
        <FormLayout onSubmit={handleCreate} columns={2} className="mb-6">
          <FormLayout.Section title="Datos del producto">
            <LabelInput id="nombre" label="Nombre" value={nombre} onChange={setNombre} required />
            <LabelInput id="sku" label="SKU" value={sku} onChange={setSku} required />
            <Selector
              id="unidad"
              label="Unidad de medida"
              options={unidadOptions.length ? unidadOptions : [{ label: 'Sin unidades', value: '' }]}
              value={unidadMedidaId}
              onChange={(v) => setUnidadMedidaId(String(v))}
            />
            <LabelInput
              id="precio"
              label="Precio costo (opcional)"
              type="number"
              value={precioCosto}
              onChange={setPrecioCosto}
            />
          </FormLayout.Section>
          <FormLayout.Footer
            primaryButton={
              <PrimaryButton type="submit" colorVariant="success" isLoading={submitting} disabled={!unidades.length}>
                Guardar producto
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
          { key: 'sku', header: 'SKU', render: (row) => <code>{row.sku}</code> },
          {
            key: 'unidad_medida_id',
            header: 'Unidad',
            render: (row) => displayUnidadMedida(row),
          },
          {
            key: 'activo',
            header: 'Estado',
            render: (row) => <StatusPill active={row.activo} />,
          },
          { key: 'empresa_id', header: 'Empresa', render: (row) => displayEmpresa(row) },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar producto..."
        serverSideSort
        emptyMessage="No hay productos."
        actions={tableActions}
      />
    </PageLayout>
  );
}
