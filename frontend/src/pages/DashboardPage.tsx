import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { healthCheck } from '@/api/auth';
import { listarProductos } from '@/api/productos';
import { listarBodegas } from '@/api/bodegas';
import { listarUsuarios } from '@/api/usuarios';
import { listarUnidadesMedida } from '@/api/unidadesMedida';
import { listarEmpresas } from '@/api/empresas';
import type { PaginatedListParams } from '@/api/listQuery';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/cards/Card';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text/Text';
import { IconScout } from '@/components/ui/images/IconScout';
import { Feedback } from '@/app/Feedback';
import { useAuthContext } from '@/context/AuthContext';
import { ApiError } from '@/api/client';
import { colors } from '@/assets/styles/colors';
import { displayEmpresa } from '@/utils/displayLabels';

const EMPRESA_MAESTRA_ID = 1;

interface DashboardStats {
  productos: number;
  bodegas: number;
  usuarios: number;
  unidadesMedida: number;
  empresas?: number;
}

interface QuickLink {
  to: string;
  title: string;
  description: string;
  icon: 'table' | 'building' | 'user' | 'layers';
}

async function fetchWarehouseStats(
  listParams: PaginatedListParams,
  includeEmpresas: boolean,
): Promise<DashboardStats> {
  const requests: Promise<{ total: number }>[] = [
    listarProductos(listParams),
    listarBodegas(listParams),
    listarUsuarios(listParams),
    listarUnidadesMedida(listParams),
  ];

  if (includeEmpresas) {
    requests.push(listarEmpresas(listParams));
  }

  const results = await Promise.all(requests);
  const [productos, bodegas, usuarios, unidades] = results;

  const stats: DashboardStats = {
    productos: productos.total,
    bodegas: bodegas.total,
    usuarios: usuarios.total,
    unidadesMedida: unidades.total,
  };

  if (includeEmpresas && results[4]) {
    stats.empresas = results[4].total;
  }

  return stats;
}

function statsToCards(stats: DashboardStats) {
  return [
    { label: 'Productos', value: stats.productos },
    { label: 'Bodegas', value: stats.bodegas },
    { label: 'Usuarios', value: stats.usuarios },
    { label: 'Unidades de medida', value: stats.unidadesMedida },
    ...(stats.empresas !== undefined ? [{ label: 'Empresas', value: stats.empresas }] : []),
  ];
}

function WarehouseSummaryCard({
  title,
  stats,
  loading,
}: {
  title: string;
  stats: DashboardStats | null;
  loading: boolean;
}) {
  const statCards = stats ? statsToCards(stats) : [];

  return (
    <Card elevation={2} padding="20px">
      <Text variant="body-medium" color={colors.primary.dash}>
        Resumen del almacén
      </Text>
      <Text variant="small-regular" color={colors.grays.neutral66} className="mt-1">
        {title}
      </Text>
      {loading ? (
        <Text variant="body-regular" className="mt-3">
          Cargando indicadores…
        </Text>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {statCards.map((item) => (
            <div key={item.label}>
              <Text variant="header-6" color={colors.primary.main}>
                {item.value}
              </Text>
              <Text variant="small-regular" color={colors.grays.neutral66}>
                {item.label}
              </Text>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function DashboardPage() {
  const { user, isSuperAdmin } = useAuthContext();
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsGlobal, setStatsGlobal] = useState<DashboardStats | null>(null);
  const [statsMaestra, setStatsMaestra] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const listParams: PaginatedListParams = { pagina: 1, porPagina: 1 };

        healthCheck()
          .then((data) => {
            if (!cancelled) {
              setApiStatus(`${data.app} v${data.version} — ${data.status}`);
            }
          })
          .catch(() => {
            if (!cancelled) setApiStatus(null);
          });

        if (isSuperAdmin) {
          const [global, maestra] = await Promise.all([
            fetchWarehouseStats(listParams, true),
            fetchWarehouseStats({ ...listParams, empresaId: EMPRESA_MAESTRA_ID }, false),
          ]);
          if (cancelled) return;
          setStatsGlobal(global);
          setStatsMaestra(maestra);
          setStats(null);
        } else {
          const tenantStats = await fetchWarehouseStats(listParams, false);
          if (cancelled) return;
          setStats(tenantStats);
          setStatsGlobal(null);
          setStatsMaestra(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'No se pudo cargar el resumen del panel');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  const quickLinks: QuickLink[] = [
    { to: '/productos', title: 'Productos', description: 'Catálogo y SKUs', icon: 'table' },
    { to: '/bodegas', title: 'Bodegas', description: 'Almacenes y ubicaciones', icon: 'building' },
    { to: '/unidades-medida', title: 'Unidades de medida', description: 'KG, UN, LT…', icon: 'layers' },
    { to: '/usuarios', title: 'Usuarios', description: 'Accesos del sistema', icon: 'user' },
    ...(isSuperAdmin
      ? [{ to: '/empresas', title: 'Empresas', description: 'Tenants del WMS', icon: 'building' as const }]
      : []),
  ];

  return (
    <PageLayout
      routes={[{ text: 'Inicio' }]}
      icon="home"
      supportingText={`Bienvenido, ${user?.email ?? 'usuario'}`}
    >
      {error && <Feedback type="error" message={error} />}

      <div className={`grid gap-4 mb-6 ${isSuperAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <Card elevation={2} padding="20px">
          <Text variant="body-medium" color={colors.primary.dash}>
            Tu sesión
          </Text>
          <div className="mt-3 space-y-2">
            <Text variant="body-regular">Email: {user?.email}</Text>
            <Text variant="body-regular">
              Empresa: {displayEmpresa(user ?? {})}
              {isSuperAdmin ? ' · Super admin' : ''}
            </Text>
            {apiStatus && (
              <Text variant="small-regular" color={colors.grays.neutral66}>
                API: {apiStatus}
              </Text>
            )}
          </div>
        </Card>

        {isSuperAdmin ? (
          <>
          <WarehouseSummaryCard
              title="Empresa maestra"
              stats={statsMaestra}
              loading={loading}
            />
            <WarehouseSummaryCard
              title="Todas las empresas"
              stats={statsGlobal}
              loading={loading}
            />
            
          </>
        ) : (
          <WarehouseSummaryCard title="Tu empresa" stats={stats} loading={loading} />
        )}
      </div>

      <Text variant="body-medium" color={colors.primary.dash} className="mb-3">
        Accesos rápidos
      </Text>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Card key={link.to} elevation={1} padding="20px" className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <IconScout name={link.icon} size="md" color={colors.primary.main} />
              <Text variant="subheader-medium" color={colors.primary.main}>
                {link.title}
              </Text>
            </div>
            <Text variant="body-regular" color={colors.grays.neutral66}>
              {link.description}
            </Text>
            <Link to={link.to}>
              <PrimaryButton size="sm" variant="outline">
                Ir a {link.title}
              </PrimaryButton>
            </Link>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
