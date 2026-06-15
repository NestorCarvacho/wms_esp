import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import {
  descargarPlantillaProductos,
  eliminarProducto,
  importarProductos,
  listarProductos,
} from '@/api/productos';
import { listarTiposProducto } from '@/api/tiposProducto';
import { listarUnidadesMedida } from '@/api/unidadesMedida';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/cards/Card';
import { PrimaryButton } from '@/components/ui/buttons';
import { Button } from '@/components/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { Text } from '@/components/ui/text/Text';
import { CrudDynamicFiltersCard } from '@/components/crud/CrudDynamicFiltersCard';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { useCrudTableFilters } from '@/crud/useCrudTableFilters';
import { dependentSelectOptions } from '@/crud/crudFilterHelpers';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Producto, ProductoImportacionResultado, TipoProducto, UnidadMedida } from '@/types/api';
import { displayEmpresa, displayTipoProducto, displayUnidadMedida } from '@/utils/displayLabels';
import type { TableAction } from '@/components/ui/tables';

const PRODUCTO_FILTER_INITIAL = { unidad: '', tipo: '' } as const;

export function ProductosPage() {
  const { notifySuccess, notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const tableFilters = useCrudTableFilters({ ...PRODUCTO_FILTER_INITIAL });

  const [unidadesFiltro, setUnidadesFiltro] = useState<UnidadMedida[]>([]);
  const [tiposFiltro, setTiposFiltro] = useState<TipoProducto[]>([]);
  const puedeFiltrarUnidad = listFilter.puedeFiltrarDependientes;

  useEffect(() => {
    if (!puedeFiltrarUnidad) {
      setUnidadesFiltro([]);
      setTiposFiltro([]);
      return;
    }
    let cancelled = false;
    const listParams = {
      pagina: 1,
      porPagina: 500,
      ...(listFilter.empresaIdParam != null ? { empresaId: listFilter.empresaIdParam } : {}),
    };
    Promise.all([listarUnidadesMedida(listParams), listarTiposProducto(listParams)])
      .then(([uniRes, tiposRes]) => {
        if (cancelled) return;
        setUnidadesFiltro(uniRes.productos ?? []);
        setTiposFiltro(tiposRes.tipos_producto);
      })
      .catch(() => {
        if (!cancelled) {
          setUnidadesFiltro([]);
          setTiposFiltro([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [puedeFiltrarUnidad, listFilter.empresaIdParam]);

  useEffect(() => {
    tableFilters.setFilter('unidad', '');
    tableFilters.setFilter('tipo', '');
  }, [listFilter.empresaIdParam]);

  const unidadFilterOptions = useMemo(
    () =>
      dependentSelectOptions(
        puedeFiltrarUnidad,
        unidadesFiltro.map((u) => ({
          label: `${u.nombre}${u.codigo ? ` (${u.codigo})` : ''}`,
          value: String(u.id),
        })),
        { allLabel: 'Todas las unidades' },
      ),
    [puedeFiltrarUnidad, unidadesFiltro],
  );

  const tipoFilterOptions = useMemo(
    () =>
      dependentSelectOptions(
        puedeFiltrarUnidad,
        tiposFiltro.map((t) => ({ label: t.nombre, value: String(t.id) })),
        { allLabel: 'Todos los tipos' },
      ),
    [puedeFiltrarUnidad, tiposFiltro],
  );

  const listFilterFields = useMemo(
    () => [
      listFilter.empresaField,
      {
        id: 'tipo',
        label: 'Tipo de producto',
        type: 'selector' as const,
        options: tipoFilterOptions,
        searchable: true,
        disabled: !puedeFiltrarUnidad || tiposFiltro.length === 0,
      },
      {
        id: 'unidad',
        label: 'Unidad base de stock',
        type: 'selector' as const,
        options: unidadFilterOptions,
        searchable: true,
        disabled: !puedeFiltrarUnidad || unidadesFiltro.length === 0,
      },
    ],
    [
      listFilter.empresaField,
      tipoFilterOptions,
      unidadFilterOptions,
      puedeFiltrarUnidad,
      tiposFiltro.length,
      unidadesFiltro.length,
    ],
  );

  const tableFilterValues = useMemo(
    () => ({
      ...listFilter.filterValues,
      tipo: tableFilters.values.tipo,
      unidad: tableFilters.values.unidad,
    }),
    [listFilter.filterValues, tableFilters.values.tipo, tableFilters.values.unidad],
  );

  const mapProductoFiltersToParams = useCallback(
    (filters: Record<string, string | number | undefined>) => {
      const unidad = (filters.unidad as string | undefined)?.trim();
      const tipo = (filters.tipo as string | undefined)?.trim();
      const extra: Record<string, string> = {};
      if (unidad) extra.unidad_medida_id = unidad;
      if (tipo) extra.tipo_producto_id = tipo;
      return Object.keys(extra).length > 0 ? extra : undefined;
    },
    [],
  );

  const table = usePaginatedCrudTable<Producto>({
    empresaFilterId: listFilter.empresaIdParam,
    filterValues: tableFilters.debouncedValues,
    mapFiltersToParams: mapProductoFiltersToParams,
    fetchPage: async (params) => {
      const res = await listarProductos(params);
      return { total: res.total, items: res.productos };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar productos'),
  });

  const [importing, setImporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importResult, setImportResult] = useState<ProductoImportacionResultado | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const tableActions: TableAction<Producto>[] = [
    {
      id: 'presentaciones',
      label: 'Presentaciones',
      icon: 'layers',
      onClick: (row) => {
        openSidePanel({
          component: 'ProductoPresentacionesPanel',
          title: 'Presentaciones del producto',
          props: { producto: row, onSaved: table.reload },
        });
      },
    },
    ...createCrudTableActions<Producto>({
      onEdit: (row) => {
        void listarUnidadesMedida({
          pagina: 1,
          porPagina: 500,
          ...(row.empresa_id != null ? { empresaId: row.empresa_id } : {}),
        })
          .then((res) => {
            openSidePanel({
              component: 'ProductoEditPanel',
              title: 'Editar producto',
              props: { producto: row, unidades: res.productos ?? [], onSaved: table.reload },
            });
          })
          .catch((err) => notifyApiError(err, 'Error al cargar unidades de medida'));
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
    }),
  ];

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Productos' }]}
      icon="table"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex flex-wrap justify-end gap-2 mb-4">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={importing || downloadingTemplate}
              className="rounded-full font-medium gap-1.5"
            >
              {importing || downloadingTemplate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Carga masiva
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[11rem]">
            <DropdownMenuItem
              className="cursor-pointer"
              disabled={downloadingTemplate}
              onSelect={() => {
                void handleDownloadTemplate();
              }}
            >
              Descargar plantilla
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              disabled={importing}
              onSelect={() => {
                fileInputRef.current?.click();
              }}
            >
              Importar Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xlsm"
          className="hidden"
          onChange={handleFileChange}
        />
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'ProductoCreatePanel',
              title: 'Nuevo producto',
              props: { onSaved: table.reload },
            })
          }
        >
          Nuevo producto
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

      <CrudDynamicFiltersCard
        fields={listFilterFields}
        values={tableFilterValues}
        onChange={(id, value) => {
          if (id === 'empresa') {
            listFilter.handleEmpresaChange(value);
            return;
          }
          tableFilters.setFilter(id, value);
        }}
      />

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'sku', header: 'SKU', sortable: true, render: (row) => <code>{row.sku}</code> },
          {
            key: 'tipo_producto_id',
            header: 'Tipo',
            render: (row) => displayTipoProducto(row),
          },
          {
            key: 'unidad_medida_id',
            header: 'Unidad base',
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
        searchPlaceholder="Buscar nombre o SKU…"
        {...table.sortProps}
        emptyMessage="No hay productos."
        actions={tableActions}
      />
    </PageLayout>
  );
}
