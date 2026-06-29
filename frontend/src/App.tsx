import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { UIProvider } from '@/context/UIContext';
import { registerCrudPanels } from './components/crud/registerCrudPanels';

import MainLayout from '@/components/layout/MainLayout';

import { ProtectedRoute } from '@/routing/ProtectedRoute';
import { PermissionRoute } from '@/routing/PermissionRoute';
import { ROUTE_PERMISSIONS } from '@/api/menuConfig';
import { appPath } from '@/routes/paths';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { DashboardPage } from '@/pages/DashboardPage';

import { ProductosPage } from '@/pages/ProductosPage';
import { ConsultaProductoPage } from '@/pages/ConsultaProductoPage';

import { BodegasPage } from '@/pages/BodegasPage';
import { TiposZonaPage } from '@/pages/TiposZonaPage';
import { TiposProductoPage } from '@/pages/TiposProductoPage';
import { ZonasBodegaPage } from '@/pages/ZonasBodegaPage';
import { InventarioIndexRedirect, InventarioPage } from '@/pages/InventarioPage';

import { UsuariosPage } from '@/pages/UsuariosPage';

import { EmpresasPage } from '@/pages/EmpresasPage';

import { UnidadesMedidaPage } from '@/pages/UnidadesMedidaPage';
import { CargosPage } from '@/pages/CargosPage';
import { RolesPage } from '@/pages/RolesPage';
import { AsignarPermisosPage } from '@/pages/AsignarPermisosPage';
import { PermisosPage } from '@/pages/PermisosPage';
import { PerfilPage } from '@/pages/PerfilPage';
import SidePanelContainer from '@/components/layout/SidePanelContainer';
import NotificationContainer from '@/components/layout/NotificationContainer';
import { ModalContainer } from '@/components/layout/ModalContainer';
import { TooltipProvider } from '@/components/ui/shadcn/tooltip';

registerCrudPanels();

function LegacyInventarioRedirect() {
  const { pathname } = useLocation();
  const suffix = pathname.replace(/^\/inventario/, '') || '/dashboard';
  return <Navigate to={appPath(`/inventario${suffix}`)} replace />;
}

function guarded(path: string, element: ReactNode) {
  const permission = ROUTE_PERMISSIONS[path];
  if (!permission) return element;
  return <PermissionRoute permission={permission}>{element}</PermissionRoute>;
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <UIProvider>
        <TooltipProvider delayDuration={200} skipDelayDuration={0}>
        <BrowserRouter>

        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/olvido-contrasena" element={<ForgotPasswordPage />} />
          <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />

          <Route
            path="app"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >

            <Route index element={<DashboardPage />} />

            <Route path="productos" element={guarded(appPath('/productos'), <ProductosPage />)} />
            <Route path="productos/consulta" element={guarded(appPath('/productos/consulta'), <ConsultaProductoPage />)} />
            <Route path="tipos-producto" element={guarded(appPath('/tipos-producto'), <TiposProductoPage />)} />

            <Route path="bodegas" element={guarded(appPath('/bodegas'), <BodegasPage />)} />
            <Route path="tipos-zona" element={guarded(appPath('/tipos-zona'), <TiposZonaPage />)} />
            <Route path="zonas-bodega" element={guarded(appPath('/zonas-bodega'), <ZonasBodegaPage />)} />
            <Route path="inventario" element={<InventarioIndexRedirect />} />
            <Route path="inventario/dashboard" element={guarded(appPath('/inventario/dashboard'), <InventarioPage vista="dashboard" />)} />
            <Route path="inventario/stock" element={guarded(appPath('/inventario/stock'), <InventarioPage vista="stock" />)} />
            <Route path="inventario/movimientos" element={guarded(appPath('/inventario/movimientos'), <InventarioPage vista="movimientos" />)} />
            <Route path="inventario/recepcion" element={guarded(appPath('/inventario/recepcion'), <InventarioPage vista="recepcion" />)} />
            <Route path="inventario/traslado" element={guarded(appPath('/inventario/traslado'), <InventarioPage vista="traslado" />)} />
            <Route path="inventario/despacho" element={guarded(appPath('/inventario/despacho'), <InventarioPage vista="despacho" />)} />
            <Route
              path="inventario/configuracion"
              element={guarded(appPath('/inventario/configuracion'), <InventarioPage vista="configuracion" />)}
            />

            <Route path="usuarios" element={guarded(appPath('/usuarios'), <UsuariosPage />)} />

            <Route path="cargos" element={guarded(appPath('/cargos'), <CargosPage />)} />
            <Route path="roles" element={guarded(appPath('/roles'), <RolesPage />)} />
            <Route path="asignar-permisos" element={guarded(appPath('/asignar-permisos'), <AsignarPermisosPage />)} />
            <Route path="permisos" element={guarded(appPath('/permisos'), <PermisosPage />)} />

            <Route path="empresas" element={guarded(appPath('/empresas'), <EmpresasPage />)} />

            <Route path="unidades-medida" element={guarded(appPath('/unidades-medida'), <UnidadesMedidaPage />)} />
            <Route path="perfil" element={<PerfilPage />} />

            <Route path="permisos-cargo" element={<Navigate to={appPath('/asignar-permisos')} replace />} />

          </Route>

          {/* Compatibilidad con URLs antiguas (pre-landing) */}
          <Route path="productos" element={<Navigate to={appPath('/productos')} replace />} />
          <Route path="inventario/*" element={<LegacyInventarioRedirect />} />

          <Route path="*" element={<NotFoundPage />} />

        </Routes>

        <ModalContainer />
        <SidePanelContainer />
        <NotificationContainer />
        </BrowserRouter>
        </TooltipProvider>
      </UIProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
