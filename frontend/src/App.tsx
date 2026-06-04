import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
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
            <Route path="inventario" element={<InventarioIndexRedirect />} />
            <Route path="inventario/stock" element={guarded('/inventario/stock', <InventarioPage vista="stock" />)} />
            <Route path="inventario/movimientos" element={guarded('/inventario/movimientos', <InventarioPage vista="movimientos" />)} />
            <Route path="inventario/recepcion" element={guarded('/inventario/recepcion', <InventarioPage vista="recepcion" />)} />
            <Route path="inventario/traslado" element={guarded('/inventario/traslado', <InventarioPage vista="traslado" />)} />
            <Route path="inventario/despacho" element={guarded('/inventario/despacho', <InventarioPage vista="despacho" />)} />
            <Route
              path="inventario/configuracion"
              element={guarded('/inventario/configuracion', <InventarioPage vista="configuracion" />)}
            />

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
