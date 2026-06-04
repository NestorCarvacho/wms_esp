import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarRoles } from '@/api/roles';
import { listarPermisos, listarPermisosRol, sincronizarPermisosRol } from '@/api/permisos';
import { provisionarRbacEmpresa } from '@/api/empresas';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/cards/Card';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text/Text';
import { CrudDynamicFiltersCard } from '@/components/crud/CrudDynamicFiltersCard';
import { dependentSelectOptions } from '@/crud/crudFilterHelpers';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permiso, Rol } from '@/types/api';
import {
  accionesEnCatalogo,
  labelAccion,
  agruparPermisosPorModulo,
  celdaPorAccion,
} from '@/utils/permisoMatrix';

export function AsignarPermisosPage() {
  const { notifySuccess, notifyApiError } = useCrudUi();
  const { tienePermiso } = usePermissions();
  const puedeEditar = tienePermiso('roles.editar');

  const listFilter = useCrudEmpresaFilterCard();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [rolId, setRolId] = useState('');
  const [permisoIds, setPermisoIds] = useState<number[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);
  const [loadingRol, setLoadingRol] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const puedeFiltrar = listFilter.puedeFiltrarDependientes;

  const loadCatalogos = useCallback(async () => {
    if (!puedeFiltrar) {
      setRoles([]);
      setPermisos([]);
      setRolId('');
      setPermisoIds([]);
      setLoadingCatalogo(false);
      return;
    }
    setLoadingCatalogo(true);
    try {
      const listParams = {
        pagina: 1,
        porPagina: 500,
        ...(listFilter.empresaIdParam != null ? { empresaId: listFilter.empresaIdParam } : {}),
      };
      const [rolesRes, permisosResInitial] = await Promise.all([
        listarRoles(listParams),
        listarPermisos(listParams),
      ]);
      let rolesFinal = rolesRes;
      let permisosFinal = permisosResInitial;
      if (
        permisosResInitial.permisos.length === 0 &&
        listFilter.empresaIdParam != null &&
        listFilter.empresaIdParam !== 1
      ) {
        await provisionarRbacEmpresa(listFilter.empresaIdParam);
        [rolesFinal, permisosFinal] = await Promise.all([
          listarRoles(listParams),
          listarPermisos(listParams),
        ]);
        notifySuccess('Catálogo de permisos inicializado para la empresa');
      }
      setRoles(rolesFinal.roles);
      setPermisos(permisosFinal.permisos);
      setRolId((prev) =>
        prev && rolesFinal.roles.some((r) => String(r.id) === prev) ? prev : '',
      );
    } catch (err) {
      notifyApiError(err, 'Error al cargar roles y permisos');
      setRoles([]);
      setPermisos([]);
      setRolId('');
    } finally {
      setLoadingCatalogo(false);
    }
  }, [listFilter.empresaIdParam, notifyApiError, notifySuccess, puedeFiltrar]);

  useEffect(() => {
    void loadCatalogos();
  }, [loadCatalogos]);

  useEffect(() => {
    setRolId('');
    setPermisoIds([]);
  }, [listFilter.empresaIdParam]);

  useEffect(() => {
    if (!rolId) {
      setPermisoIds([]);
      return;
    }
    let cancelled = false;
    setLoadingRol(true);
    listarPermisosRol(Number(rolId))
      .then((res) => {
        if (!cancelled) setPermisoIds(res.permiso_ids);
      })
      .catch((err) => {
        if (!cancelled) {
          notifyApiError(err, 'Error al cargar permisos del rol');
          setPermisoIds([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingRol(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rolId, notifyApiError]);

  const rolOptions = useMemo(
    () =>
      dependentSelectOptions(
        puedeFiltrar,
        roles.map((r) => ({
          label: r.descripcion ? `${r.nombre} — ${r.descripcion}` : r.nombre,
          value: String(r.id),
        })),
        { allLabel: 'Seleccione un rol', placeholder: 'Seleccione una empresa' },
      ),
    [puedeFiltrar, roles],
  );

  const filterFields = useMemo(
    () => [
      listFilter.empresaField,
      {
        id: 'rol',
        label: 'Rol',
        type: 'selector' as const,
        options: rolOptions,
        searchable: true,
        disabled: !puedeFiltrar || roles.length === 0 || loadingCatalogo,
      },
    ],
    [listFilter.empresaField, rolOptions, puedeFiltrar, roles.length, loadingCatalogo],
  );

  const filterValues = useMemo(
    () => ({ ...listFilter.filterValues, rol: rolId }),
    [listFilter.filterValues, rolId],
  );

  const filas = useMemo(() => agruparPermisosPorModulo(permisos), [permisos]);
  const columnas = useMemo(() => accionesEnCatalogo(filas), [filas]);

  const rolSeleccionado = roles.find((r) => String(r.id) === rolId);

  function togglePermiso(id: number) {
    if (!puedeEditar) return;
    setPermisoIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function toggleFila(filaModulo: string, activar: boolean) {
    if (!puedeEditar) return;
    const fila = filas.find((f) => f.modulo === filaModulo);
    if (!fila) return;
    const ids = fila.celdas.map((c) => c.permisoId);
    setPermisoIds((prev) => {
      if (activar) return [...new Set([...prev, ...ids])];
      return prev.filter((id) => !ids.includes(id));
    });
  }

  function toggleColumna(accion: string, activar: boolean) {
    if (!puedeEditar) return;
    const ids = filas.flatMap((f) => f.celdas.filter((c) => c.accion === accion).map((c) => c.permisoId));
    setPermisoIds((prev) => {
      if (activar) return [...new Set([...prev, ...ids])];
      return prev.filter((id) => !ids.includes(id));
    });
  }

  async function handleGuardar() {
    if (!rolId || !puedeEditar) return;
    setSubmitting(true);
    try {
      await sincronizarPermisosRol(Number(rolId), permisoIds);
      notifySuccess('Permisos del rol actualizados');
    } catch (err) {
      notifyApiError(err, 'Error al guardar permisos');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Accesos' }, { text: 'Asignar permisos' }]}
      icon="lock"
      supportingText={
        rolSeleccionado
          ? `${permisoIds.length} permiso(s) en «${rolSeleccionado.nombre}»`
          : 'Seleccione un rol'
      }
    >
      <Card elevation={1} padding="12px 16px" className="mb-4 bg-muted/40">
        <Text variant="body-medium" className="text-foreground">
          Los <strong>permisos se asignan al rol</strong>, no al cargo. El cargo es solo el puesto
          organizacional. Para dar acceso a una persona, edítela en{' '}
          <strong>Usuarios</strong> y asígnele uno o más roles.
        </Text>
      </Card>

      <CrudDynamicFiltersCard
        fields={filterFields}
        values={filterValues}
        onChange={(id, value) => {
          if (id === 'empresa') {
            listFilter.handleEmpresaChange(value);
            return;
          }
          if (id === 'rol') setRolId(String(value));
        }}
        className="mb-4"
      />

      {!rolId && !loadingCatalogo && (
        <Text variant="body-medium" className="text-muted-foreground">
          Elija empresa y rol para ver la matriz de permisos por página y acción.
        </Text>
      )}

      {rolId && (
        <>
          <div className="overflow-x-auto border border-border rounded-lg mb-4 bg-card">
            <table className="w-full text-sm border-collapse min-w-[640px] text-foreground">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="text-left p-3 font-medium text-foreground sticky left-0 bg-muted/60 z-10">
                    Página / módulo
                  </th>
                  {columnas.map((accion) => (
                    <th key={accion} className="p-3 font-medium text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        <span>{labelAccion(accion)}</span>
                        {puedeEditar && (
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                            onClick={() => toggleColumna(accion, true)}
                          >
                            Todos
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  {puedeEditar && (
                    <th className="p-3 font-medium text-center w-24">Fila</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loadingRol && (
                  <tr>
                    <td colSpan={columnas.length + 2} className="p-4 text-center text-muted-foreground">
                      Cargando permisos del rol…
                    </td>
                  </tr>
                )}
                {!loadingRol &&
                  filas.map((fila) => (
                    <tr key={fila.modulo} className="border-b border-border hover:bg-muted/40">
                      <td className="p-3 font-medium text-foreground sticky left-0 bg-card z-10">
                        {fila.label}
                      </td>
                      {columnas.map((accion) => {
                        const celda = celdaPorAccion(fila, accion);
                        return (
                          <td key={accion} className="p-3 text-center">
                            {celda ? (
                              <input
                                type="checkbox"
                                className="w-4 h-4 cursor-pointer"
                                checked={permisoIds.includes(celda.permisoId)}
                                disabled={!puedeEditar}
                                onChange={() => togglePermiso(celda.permisoId)}
                                title={celda.codigo}
                              />
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </td>
                        );
                      })}
                      {puedeEditar && (
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400 mr-2"
                            onClick={() => toggleFila(fila.modulo, true)}
                          >
                            Todo
                          </button>
                          <button
                            type="button"
                            className="text-xs text-muted-foreground hover:underline"
                            onClick={() => toggleFila(fila.modulo, false)}
                          >
                            Ninguno
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {puedeEditar ? (
            <div className="flex justify-end">
              <PrimaryButton onClick={() => void handleGuardar()} isLoading={submitting}>
                Guardar permisos del rol
              </PrimaryButton>
            </div>
          ) : (
            <Text variant="body-regular" color="#666">
              Solo lectura: necesita el permiso <code>roles.editar</code> para modificar asignaciones.
            </Text>
          )}
        </>
      )}
    </PageLayout>
  );
}
