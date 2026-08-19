import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { UIProvider } from '@/context/UIContext';
import { registerCrudPanels } from './components/crud/registerCrudPanels';
import { registerAuthPanels } from '@/components/auth/registerAuthPanels';
import { LoginPanelHost } from '@/components/auth/LoginPanelHost';

import MainLayout from '@/components/layout/MainLayout';

import { ProtectedRoute } from '@/routing/ProtectedRoute';
import { PermissionRoute } from '@/routing/PermissionRoute';
import { ROUTE_PERMISSIONS } from '@/api/menuConfig';
import { appPath } from '@/routes/paths';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { HomePage } from '@/pages/HomePage';

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

import { PreciosPage } from '@/pages/marketing/PreciosPage';
import { ContactoPage, DemoPage } from '@/pages/marketing/ContactoPage';
import {
  CompararExcelPage,
  ControlInventarioPage,
  MultiEmpresaPage,
  SoftwareBodegaPage,
  WmsPymePage,
} from '@/pages/marketing/PillarPages';
import { NosotrosPage, PrivacidadPage, TerminosPage } from '@/pages/marketing/LegalPages';
import { BlogIndexPage } from '@/pages/marketing/BlogIndexPage';
import { BlogPostPage } from '@/pages/marketing/BlogPostPage';

import { GoogleAnalytics } from '@/components/seo/GoogleAnalytics';
import SidePanelContainer from '@/components/layout/SidePanelContainer';
import NotificationContainer from '@/components/layout/NotificationContainer';
import { ModalContainer } from '@/components/layout/ModalContainer';
import { TooltipProvider } from '@/components/ui/shadcn/tooltip';

registerCrudPanels();
registerAuthPanels();

function LegacyInventarioRedirect() {
  const { pathname } = useLocation();
  const suffix = pathname.replace(/^\/inventario/, '') || '/stock';
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
    <QueryProvider>
    <AuthProvider>
    <LocaleProvider>
      <UIProvider>
        <TooltipProvider delayDuration={200} skipDelayDuration={0}>
        <HelmetProvider>
        <BrowserRouter>

        <LoginPanelHost />

        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/precios" element={<PreciosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/software-bodega" element={<SoftwareBodegaPage />} />
          <Route path="/control-inventario" element={<ControlInventarioPage />} />
          <Route path="/wms-pyme" element={<WmsPymePage />} />
          <Route path="/multi-empresa" element={<MultiEmpresaPage />} />
          <Route path="/comparar/excel" element={<CompararExcelPage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="app"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >

            <Route index element={<HomePage />} />

            <Route path="productos" element={guarded(appPath('/productos'), <ProductosPage />)} />
            <Route path="productos/consulta" element={guarded(appPath('/productos/consulta'), <ConsultaProductoPage />)} />
            <Route path="tipos-producto" element={guarded(appPath('/tipos-producto'), <TiposProductoPage />)} />

            <Route path="bodegas" element={guarded(appPath('/bodegas'), <BodegasPage />)} />
            <Route path="tipos-zona" element={guarded(appPath('/tipos-zona'), <TiposZonaPage />)} />
            <Route path="zonas-bodega" element={guarded(appPath('/zonas-bodega'), <ZonasBodegaPage />)} />
            <Route path="inventario" element={<InventarioIndexRedirect />} />
            <Route path="inventario/dashboard" element={<Navigate to={appPath('/inventario/stock')} replace />} />
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
        <GoogleAnalytics />
        </BrowserRouter>
        </HelmetProvider>
        </TooltipProvider>
      </UIProvider>
    </LocaleProvider>
    </AuthProvider>
    </QueryProvider>
    </ThemeProvider>
  );
}
