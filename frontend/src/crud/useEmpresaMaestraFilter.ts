import { useEffect, useMemo, useState } from 'react';
import { listarEmpresasParaFiltro } from '@/api/empresas';
import { useAuthContext } from '@/context/AuthContext';
import type { Empresa } from '@/types/api';
import { empresaSelectorOption } from '@/utils/displayLabels';

function resolveDefaultEmpresaFilterId(
  empresas: Empresa[],
  jwtEmpresaId: number | undefined,
  current: string,
): string {
  if (current && empresas.some((e) => String(e.id) === current)) return current;
  if (jwtEmpresaId != null) {
    const jwtStr = String(jwtEmpresaId);
    if (empresas.some((e) => String(e.id) === jwtStr)) return jwtStr;
  }
  return empresas[0] ? String(empresas[0].id) : '';
}

/** Filtro opcional por empresa en listados (empresa maestra). */
export function useEmpresaMaestraFilter() {
  const { user } = useAuthContext();
  const jwtEmpresaId = user?.empresa_id;
  const isSuperAdmin = Boolean(user?.es_empresa_maestra ?? user?.empresa_id === 1);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [empresaFilterId, setEmpresaFilterId] = useState(() =>
    jwtEmpresaId != null ? String(jwtEmpresaId) : '',
  );

  useEffect(() => {
    if (jwtEmpresaId != null) {
      setEmpresaFilterId((prev) => prev || String(jwtEmpresaId));
    }
  }, [jwtEmpresaId]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    setLoading(true);
    listarEmpresasParaFiltro()
      .then((res) => {
        if (cancelled) return;
        setEmpresas(res.empresas);
        setEmpresaFilterId((prev) => resolveDefaultEmpresaFilterId(res.empresas, jwtEmpresaId, prev));
      })
      .catch(() => {
        if (!cancelled) setEmpresas([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, jwtEmpresaId]);

  const filterOptions = useMemo(
    () => [
      { label: 'Todas las empresas administradas', value: '' },
      ...empresas.map((e) => {
        const opt = empresaSelectorOption(e);
        return { label: opt.label, value: String(e.id), searchTokens: opt.searchTokens };
      }),
    ],
    [empresas],
  );

  /** Empresa enviada al API: maestra usa el filtro; el resto siempre la del JWT. */
  const empresaIdParam = isSuperAdmin
    ? empresaFilterId
      ? Number(empresaFilterId)
      : undefined
    : jwtEmpresaId;

  return {
    showFilter: isSuperAdmin,
    isSuperAdmin,
    empresas,
    loading,
    empresaFilterId,
    setEmpresaFilterId,
    empresaIdParam,
    filterOptions,
    jwtEmpresaId,
  };
}
