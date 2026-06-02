import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarEmpresasParaFiltro } from '@/api/empresas';
import { useAuthContext } from '@/context/AuthContext';
import type { Empresa } from '@/types/api';
import { empresaSelectorOption } from '@/utils/displayLabels';

function resolveDefaultEmpresaId(
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

/** Selector de empresa obligatorio en formularios de creación (empresa maestra). */
export function useEmpresaMaestraCreateForm() {
  const { user } = useAuthContext();
  const jwtEmpresaId = user?.empresa_id;
  const isSuperAdmin = Boolean(user?.es_empresa_maestra ?? user?.empresa_id === 1);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState(() =>
    jwtEmpresaId != null ? String(jwtEmpresaId) : '',
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    setLoading(true);
    listarEmpresasParaFiltro()
      .then((res) => {
        if (cancelled) return;
        setEmpresas(res.empresas);
        setEmpresaId((prev) => resolveDefaultEmpresaId(res.empresas, jwtEmpresaId, prev));
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

  const empresaOptions = useMemo(
    () =>
      empresas.map((e) => {
        const opt = empresaSelectorOption({ ...e, id: e.id });
        return { label: opt.label, value: opt.value, searchTokens: opt.searchTokens };
      }),
    [empresas],
  );

  const resetEmpresaId = useCallback(() => {
    setEmpresaId(resolveDefaultEmpresaId(empresas, jwtEmpresaId, ''));
  }, [empresas, jwtEmpresaId]);

  const empresaIdNumber = empresaId ? Number(empresaId) : undefined;

  return {
    showEmpresaField: isSuperAdmin,
    empresas,
    empresaId,
    setEmpresaId,
    empresaIdNumber,
    loading,
    empresaOptions,
    resetEmpresaId,
    isValid: !isSuperAdmin || Boolean(empresaId),
  };
}
