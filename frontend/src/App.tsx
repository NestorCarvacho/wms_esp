import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';
import { registerCrudPanels } from './components/crud/registerCrudPanels';

import MainLayout from '@/components/layout/MainLayout';

import { ProtectedRoute } from '@/routing/ProtectedRoute';
import { PermissionRoute } from '@/routing/PermissionRoute';
import { ROUTE_PERMISSIONS } from '@/api/menuConfig';

import { LoginPage } from '@/pages/LoginPage';

import { DashboardPage } from '@/pages/DashboardPage';

import { ProductosPage } from '@/pages/ProductosPage';

import { BodegasPage } from '@/pages/BodegasPage';
import { TiposZonaPage } from '@/pages/TiposZonaPage';
import { TiposProductoPage } from '@/pages/TiposProductoPage';
import { ZonasBodegaPage } from '@/pages/ZonasBodegaPage';

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
import { ConfirmModalHost } from '@/layout/ConfirmModalHost';

registerCrudPanels();

function guarded(path: keyof typeof ROUTE_PERMISSIONS, element: ReactNode) {
  const permission = ROUTE_PERMISSIONS[path];
  return (
    <PermissionRoute permission={permission}>
      {element}
    </PermissionRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>

        <Routes>

          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >

            <Route index element={<DashboardPage />} />

            <Route path="productos" element={guarded('/productos', <ProductosPage />)} />
            <Route path="tipos-producto" element={guarded('/tipos-producto', <TiposProductoPage />)} />

            <Route path="bodegas" element={guarded('/bodegas', <BodegasPage />)} />
            <Route path="tipos-zona" element={guarded('/tipos-zona', <TiposZonaPage />)} />
            <Route path="zonas-bodega" element={guarded('/zonas-bodega', <ZonasBodegaPage />)} />

            <Route path="usuarios" element={guarded('/usuarios', <UsuariosPage />)} />

            <Route path="cargos" element={guarded('/cargos', <CargosPage />)} />
            <Route path="roles" element={guarded('/roles', <RolesPage />)} />
            <Route path="asignar-permisos" element={guarded('/asignar-permisos', <AsignarPermisosPage />)} />
            <Route path="permisos" element={guarded('/permisos', <PermisosPage />)} />

            <Route path="empresas" element={guarded('/empresas', <EmpresasPage />)} />

            <Route path="unidades-medida" element={guarded('/unidades-medida', <UnidadesMedidaPage />)} />
            <Route path="perfil" element={<PerfilPage />} />

            <Route path="permisos-cargo" element={<Navigate to="/asignar-permisos" replace />} />

          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

        <ConfirmModalHost />
        <SidePanelContainer />
        <NotificationContainer />
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}
