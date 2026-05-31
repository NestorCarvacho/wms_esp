import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { healthCheck } from '@/api/auth';
import { listarProductos } from '@/api/productos';
import { listarBodegas } from '@/api/bodegas';
import { listarUsuarios } from '@/api/usuarios';
import { listarUnidadesMedida } from '@/api/unidadesMedida';
import { listarEmpresas } from '@/api/empresas';
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

export function DashboardPage() {
  const { user, isSuperAdmin } = useAuthContext();
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const requests: Promise<unknown>[] = [
          listarProductos({ pagina: 1, porPagina: 1 }),
          listarBodegas({ pagina: 1, porPagina: 1 }),
          listarUsuarios({ pagina: 1, porPagina: 1 }),
          listarUnidadesMedida({ pagina: 1, porPagina: 1 }),
          healthCheck().then((data) => {
            if (!cancelled) {
              setApiStatus(`${data.app} v${data.version} — ${data.status}`);
            }
          }).catch(() => {
            if (!cancelled) setApiStatus(null);
          }),
        ];

        if (isSuperAdmin) {
          requests.push(listarEmpresas({ pagina: 1, porPagina: 1 }));
        }

        const results = await Promise.all(requests);
        if (cancelled) return;

        const [productos, bodegas, usuarios, unidades] = results as [
          { total: number },
          { total: number },
          { total: number },
          { total: number },
        ];

        const nextStats: DashboardStats = {
          productos: productos.total,
          bodegas: bodegas.total,
          usuarios: usuarios.total,
          unidadesMedida: unidades.total,
        };

        if (isSuperAdmin && results[5]) {
          nextStats.empresas = (results[5] as { total: number }).total;
        }

        setStats(nextStats);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'No se pudo cargar el resumen del panel');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
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

  const statCards = stats
    ? [
        { label: 'Productos', value: stats.productos },
        { label: 'Bodegas', value: stats.bodegas },
        { label: 'Usuarios', value: stats.usuarios },
        { label: 'Unidades de medida', value: stats.unidadesMedida },
        ...(stats.empresas !== undefined ? [{ label: 'Empresas', value: stats.empresas }] : []),
      ]
    : [];

  return (
    <PageLayout
      routes={[{ text: 'Inicio' }]}
      icon="home"
      supportingText={`Bienvenido, ${user?.email ?? 'usuario'}`}
    >
      {error && <Feedback type="error" message={error} />}

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card elevation={2} padding="20px">
          <Text variant="body-medium" color={colors.primary.dash}>Tu sesión</Text>
          <div className="mt-3 space-y-2">
            <Text variant="body-regular">Email: {user?.email}</Text>
            <Text variant="body-regular">
              Empresa: {displayEmpresa(user ?? {})}{isSuperAdmin ? ' · Super admin' : ''}
            </Text>
            {apiStatus && (
              <Text variant="small-regular" color={colors.grays.neutral66}>
                API: {apiStatus}
              </Text>
            )}
          </div>
        </Card>

        <Card elevation={2} padding="20px">
          <Text variant="body-medium" color={colors.primary.dash}>Resumen del almacén</Text>
          {loading ? (
            <Text variant="body-regular" className="mt-3">Cargando indicadores…</Text>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {statCards.map((item) => (
                <div key={item.label}>
                  <Text variant="header-6" color={colors.primary.main}>{item.value}</Text>
                  <Text variant="small-regular" color={colors.grays.neutral66}>{item.label}</Text>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Text variant="body-medium" color={colors.primary.dash} className="mb-3">
        Accesos rápidos
      </Text>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Card key={link.to} elevation={1} padding="20px" className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <IconScout name={link.icon} size="md" color={colors.primary.main} />
              <Text variant="subheader-medium" color={colors.primary.main}>{link.title}</Text>
            </div>
            <Text variant="body-regular" color={colors.grays.neutral66}>{link.description}</Text>
            <Link to={link.to}>
              <PrimaryButton size="sm" variant="outline">Ir a {link.title}</PrimaryButton>
            </Link>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
