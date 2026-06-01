import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarEmpresas } from '@/api/empresas';
import { useAuthContext } from '@/context/AuthContext';
import type { Empresa } from '@/types/api';

export function useEmpresaMaestraFilter() {
  const { isSuperAdmin } = useAuthContext();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaFilterId, setEmpresaFilterId] = useState('');
  const [loading, setLoading] = useState(false);

  const loadEmpresas = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const res = await listarEmpresas({ pagina: 1, porPagina: 200 });
      setEmpresas(res.empresas.filter((e) => e.esta_activa));
    } catch {
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) void loadEmpresas();
  }, [isSuperAdmin, loadEmpresas]);

  const empresaIdParam = empresaFilterId ? Number(empresaFilterId) : undefined;

  const filterOptions = useMemo(
    () => [
      { label: 'Todas las empresas', value: '' },
      ...empresas.map((e) => ({
        label: `${e.codigo} — ${e.nombre}`,
        value: String(e.id),
      })),
    ],
    [empresas],
  );

  return {
    showFilter: isSuperAdmin,
    empresas,
    loading,
    empresaFilterId,
    setEmpresaFilterId,
    empresaIdParam,
    filterOptions,
  };
}
