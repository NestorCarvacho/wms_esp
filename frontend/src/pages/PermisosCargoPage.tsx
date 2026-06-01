import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarCargos } from '@/api/cargos';
import { listarRoles } from '@/api/roles';
import { listarRolesCargo, sincronizarRolesCargo } from '@/api/permisos';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/cards/Card';
import { PrimaryButton } from '@/components/ui/buttons';
import { CrudDynamicFiltersCard } from '@/components/crud/CrudDynamicFiltersCard';
import { dependentSelectOptions } from '@/crud/crudFilterHelpers';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import type { Cargo, Rol } from '@/types/api';

export function PermisosCargoPage() {
  const { notifySuccess, notifyApiError } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargoId, setCargoId] = useState('');
  const [rolIds, setRolIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const puedeFiltrarCargo = listFilter.puedeFiltrarDependientes;

  const loadCatalogos = useCallback(async () => {
    if (!puedeFiltrarCargo) {
      setCargos([]);
      setRoles([]);
      setCargoId('');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const listParams = {
        pagina: 1,
        porPagina: 200,
        ...(listFilter.empresaIdParam != null ? { empresaId: listFilter.empresaIdParam } : {}),
      };
      const [cargosRes, rolesRes] = await Promise.all([
        listarCargos(listParams),
        listarRoles(listParams),
      ]);
      setCargos(cargosRes.cargos);
      setRoles(rolesRes.roles);
      setCargoId((prev) => {
        if (prev && cargosRes.cargos.some((c) => String(c.id) === prev)) return prev;
        return '';
      });
    } catch (err) {
      notifyApiError(err, 'Error al cargar datos');
      setCargos([]);
      setRoles([]);
      setCargoId('');
    } finally {
      setLoading(false);
    }
  }, [listFilter.empresaIdParam, notifyApiError, puedeFiltrarCargo]);

  useEffect(() => {
    void loadCatalogos();
  }, [loadCatalogos]);

  useEffect(() => {
    setCargoId('');
  }, [listFilter.empresaIdParam]);

  const cargoFilterOptions = useMemo(
    () =>
      dependentSelectOptions(
        puedeFiltrarCargo,
        cargos.map((c) => ({
          label: c.empresa_nombre ? `${c.nombre} (${c.empresa_nombre})` : c.nombre,
          value: String(c.id),
        })),
        { allLabel: 'Seleccione un cargo', placeholder: 'Seleccione una empresa' },
      ),
    [puedeFiltrarCargo, cargos],
  );

  const listFilterFields = useMemo(
    () => [
      listFilter.empresaField,
      {
        id: 'cargo',
        label: 'Cargo',
        type: 'selector' as const,
        options: cargoFilterOptions,
        searchable: true,
        disabled: !puedeFiltrarCargo || cargos.length === 0 || loading,
      },
    ],
    [listFilter.empresaField, cargoFilterOptions, puedeFiltrarCargo, cargos.length, loading],
  );

  const filterValues = useMemo(
    () => ({
      ...listFilter.filterValues,
      cargo: cargoId,
    }),
    [listFilter.filterValues, cargoId],
  );

  useEffect(() => {
    if (!cargoId) {
      setRolIds([]);
      return;
    }
    listarRolesCargo(Number(cargoId))
      .then((res) => setRolIds(res.rol_ids))
      .catch(() => setRolIds([]));
  }, [cargoId]);

  const cargoSeleccionado = cargos.find((c) => String(c.id) === cargoId);
  const rolesEmpresa = roles.filter((r) => r.empresa_id === cargoSeleccionado?.empresa_id);

  function toggleRol(id: number) {
    setRolIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (!cargoId) return;
    setSubmitting(true);
    try {
      await sincronizarRolesCargo(Number(cargoId), rolIds);
      notifySuccess('Roles del cargo actualizados');
    } catch (err) {
      notifyApiError(err, 'Error al guardar roles del cargo');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Roles por cargo' }]}
      icon="lock"
      supportingText="Asigna roles reutilizables a cada cargo"
    >
      <div className="flex w-full flex-col gap-4">
        <CrudDynamicFiltersCard
          columns={2}
          fields={listFilterFields}
          values={filterValues}
          onChange={(id, value) => {
            if (id === 'empresa') {
              listFilter.handleEmpresaChange(value);
              return;
            }
            if (id === 'cargo') setCargoId(value);
          }}
        />

        <Card padding="2rem">
          <p className="text-sm font-medium mb-3">Roles asignados al cargo</p>
          {loading && <p className="text-sm text-gray-500">Cargando…</p>}
          {!loading && !cargoId && (
            <p className="text-sm text-gray-500">Seleccione un cargo para ver y editar sus roles.</p>
          )}
          {!loading && cargoId && rolesEmpresa.length === 0 && (
            <p className="text-sm text-gray-500">No hay roles para esta empresa.</p>
          )}
          <div className="flex flex-col gap-2">
            {rolesEmpresa.map((rol) => (
              <label key={rol.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolIds.includes(rol.id)}
                  onChange={() => toggleRol(rol.id)}
                  disabled={!cargoId}
                />
                <span className="font-medium">{rol.nombre}</span>
                {rol.descripcion && <span className="text-gray-500">— {rol.descripcion}</span>}
              </label>
            ))}
          </div>
        </Card>

        <PrimaryButton
          className="self-start"
          onClick={handleSave}
          colorVariant="success"
          isLoading={submitting}
          disabled={!cargoId || loading}
        >
          Guardar asignación
        </PrimaryButton>
      </div>
    </PageLayout>
  );
}
