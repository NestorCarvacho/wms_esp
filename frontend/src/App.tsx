import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';
import { registerCrudPanels } from './components/crud/registerCrudPanels';

import MainLayout from '@/components/layout/MainLayout';

import { ProtectedRoute } from '@/routing/ProtectedRoute';

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
import { PermisosCargoPage } from '@/pages/PermisosCargoPage';
import { PermisosPage } from '@/pages/PermisosPage';
import { PerfilPage } from '@/pages/PerfilPage';
import SidePanelContainer from '@/components/layout/SidePanelContainer';
import NotificationContainer from '@/components/layout/NotificationContainer';
import { ConfirmModalHost } from '@/layout/ConfirmModalHost';

registerCrudPanels();

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

            <Route path="productos" element={<ProductosPage />} />
            <Route path="tipos-producto" element={<TiposProductoPage />} />

            <Route path="bodegas" element={<BodegasPage />} />
            <Route path="tipos-zona" element={<TiposZonaPage />} />
            <Route path="zonas-bodega" element={<ZonasBodegaPage />} />

            <Route path="usuarios" element={<UsuariosPage />} />

            <Route path="cargos" element={<CargosPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="permisos" element={<PermisosPage />} />
            <Route path="permisos-cargo" element={<PermisosCargoPage />} />

            <Route path="empresas" element={<EmpresasPage />} />

            <Route path="unidades-medida" element={<UnidadesMedidaPage />} />
            <Route path="perfil" element={<PerfilPage />} />

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

