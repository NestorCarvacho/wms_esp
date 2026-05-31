import { useCallback, useEffect, useState } from 'react';
import { listarCargos } from '@/api/cargos';
import { listarRoles } from '@/api/roles';
import { listarRolesCargo, sincronizarRolesCargo } from '@/api/permisos';
import { PageLayout } from '@/components/layout/PageLayout';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { useCrudUi } from '@/crud/useCrudUi';
import type { Cargo, Rol } from '@/types/api';

export function PermisosCargoPage() {
  const { notifySuccess, notifyApiError } = useCrudUi();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargoId, setCargoId] = useState('');
  const [rolIds, setRolIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadCatalogos = useCallback(async () => {
    setLoading(true);
    try {
      const [cargosRes, rolesRes] = await Promise.all([
        listarCargos({ pagina: 1, porPagina: 200 }),
        listarRoles({ pagina: 1, porPagina: 200 }),
      ]);
      setCargos(cargosRes.cargos);
      setRoles(rolesRes.roles);
      if (cargosRes.cargos.length) {
        setCargoId(String(cargosRes.cargos[0].id));
      }
    } catch (err) {
      notifyApiError(err, 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [notifyApiError]);

  useEffect(() => {
    loadCatalogos();
  }, [loadCatalogos]);

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

  const cargoOptions = cargos.map((c) => ({
    label: c.empresa_nombre ? `${c.nombre} (${c.empresa_nombre})` : c.nombre,
    value: String(c.id),
  }));

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Roles por cargo' }]}
      icon="lock"
      supportingText="Asigna roles reutilizables a cada cargo"
    >
      <div className="max-w-xl flex flex-col gap-4">
        <Selector
          id="cargoId"
          label="Cargo"
          options={cargoOptions.length ? cargoOptions : [{ label: 'Sin cargos', value: '' }]}
          value={cargoId}
          onChange={(v) => setCargoId(String(v))}
          searchable
          disabled={loading}
        />

        <div className="border rounded-lg p-4">
          <p className="text-sm font-medium mb-3">Roles asignados al cargo</p>
          {loading && <p className="text-sm text-gray-500">Cargando…</p>}
          {!loading && rolesEmpresa.length === 0 && (
            <p className="text-sm text-gray-500">No hay roles para esta empresa.</p>
          )}
          <div className="flex flex-col gap-2">
            {rolesEmpresa.map((rol) => (
              <label key={rol.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={rolIds.includes(rol.id)}
                  onChange={() => toggleRol(rol.id)}
                />
                <span className="font-medium">{rol.nombre}</span>
                {rol.descripcion && <span className="text-gray-500">— {rol.descripcion}</span>}
              </label>
            ))}
          </div>
        </div>

        <PrimaryButton
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
