export interface ApiResponse<T = unknown> {
  exito: boolean;
  datos: T | null;
  mensaje: string;
  errores?: string[] | null;
}

export interface Usuario {
  id: number;
  empresa_id: number;
  cargo_id: number | null;
  email: string;
  activo: boolean;
  fecha_creacion: string;
  ultimo_login?: string | null;
  fecha_actualizacion?: string;
  perfil?: PerfilUsuario | null;
  empresa_nombre?: string | null;
  cargo_nombre?: string | null;
  es_empresa_maestra?: boolean;
  roles?: string[];
  permisos?: string[];
}

export interface PerfilUsuario {
  usuario_id: number;
  rut?: string | null;
  nombres?: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  comuna?: string | null;
  ciudad?: string | null;
  region?: string | null;
  pais?: string | null;
  foto_url?: string | null;
  biografia?: string | null;
}

export interface PerfilUsuarioActualizar {
  rut?: string | null;
  nombres?: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  fecha_nacimiento?: string | null;
  genero?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  comuna?: string | null;
  ciudad?: string | null;
  region?: string | null;
  pais?: string | null;
  foto_url?: string | null;
  biografia?: string | null;
}

export interface UsuarioActualizar {
  email?: string;
  cargo_id?: number | null;
  contrasena?: string;
  activo?: boolean;
}

export interface LoginData {
  acceso_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface PaginatedProductos {
  total: number;
  pagina: number;
  por_pagina: number;
  productos: Producto[];
}

export interface Producto {
  id: number;
  nombre: string;
  sku: string;
  activo: number;
  empresa_id?: number;
  empresa_nombre?: string | null;
  unidad_medida_id?: number;
  unidad_medida_nombre?: string | null;
  tipo_producto_id?: number | null;
  tipo_producto_nombre?: string | null;
  precio_costo?: number | null;
}

export interface ProductoCrear {
  nombre: string;
  sku: string;
  activo: number;
  unidad_medida_id: number;
  tipo_producto_id?: number | null;
  precio_costo?: number | null;
  empresa_id?: number;
}

export interface ProductoActualizar {
  nombre?: string;
  sku?: string;
  activo?: number;
  unidad_medida_id?: number;
  tipo_producto_id?: number | null;
  precio_costo?: number | null;
}

export interface TipoProducto {
  id: number;
  nombre: string;
  activo?: number | boolean;
  empresa_id?: number;
  empresa_nombre?: string | null;
}

export interface TipoProductoCrear {
  nombre: string;
  empresa_id?: number;
}

export interface TipoProductoActualizar {
  nombre?: string;
  activo?: number;
}

export interface PaginatedTiposProducto {
  total: number;
  pagina: number;
  por_pagina: number;
  tipos_producto: TipoProducto[];
}

export interface ProductoPresentacion {
  id: number;
  producto_id: number;
  nombre: string;
  cantidad_contenida: number;
  unidad_medida_id: number;
  unidad_medida_nombre?: string | null;
  precio_costo?: number | null;
  precio_venta?: number | null;
  permite_venta_unidad: boolean | number;
  permite_venta_presentacion: boolean | number;
  activo?: boolean | number;
}

export interface ProductoPresentacionCrear {
  nombre: string;
  cantidad_contenida: number;
  unidad_medida_id: number;
  precio_costo?: number | null;
  precio_venta?: number | null;
  permite_venta_unidad?: number;
  permite_venta_presentacion?: number;
}

export interface ProductoPresentacionActualizar {
  nombre?: string;
  cantidad_contenida?: number;
  unidad_medida_id?: number;
  precio_costo?: number | null;
  precio_venta?: number | null;
  permite_venta_unidad?: number;
  permite_venta_presentacion?: number;
  activo?: number;
}

export interface PaginatedProductoPresentaciones {
  total: number;
  pagina: number;
  por_pagina: number;
  presentaciones: ProductoPresentacion[];
}

export interface VentaDescuentoRequest {
  presentacion_id: number;
  cantidad: number;
  venta_por_presentacion: boolean;
}

export interface VentaDescuentoResultado {
  presentacion_id: number;
  producto_id: number;
  cantidad_vendida: number;
  venta_por_presentacion: boolean;
  descuento_unidades_base: number;
  unidad_base_producto_id: number;
}

export interface ProductoImportacionError {
  fila: number;
  sku?: string | null;
  errores: string[];
}

export interface ProductoImportacionResultado {
  total_filas: number;
  creados: number;
  con_errores: number;
  errores: ProductoImportacionError[];
}

export interface PaginatedBodegas {
  total: number;
  pagina: number;
  por_pagina: number;
  bodegas: Bodega[];
}

export interface Bodega {
  id: number;
  nombre: string;
  codigo: string;
  activo: number;
  empresa_id?: number;
  empresa_nombre?: string | null;
}

export interface BodegaCrear {
  nombre: string;
  codigo: string;
  activo: number;
}

export interface BodegaActualizar {
  nombre?: string;
  codigo?: string;
  activo?: number;
}

export interface PaginatedUnidadesMedida {
  total: number;
  pagina: number;
  por_pagina: number;
  /** El backend actualmente devuelve esta clave por error en unidadMedidad_service */
  productos: UnidadMedida[];
}

export interface UnidadMedida {
  id: number;
  nombre: string;
  codigo?: string;
  activo?: number;
  empresa_id?: number;
  empresa_nombre?: string | null;
}

export interface PaginatedUsuarios {
  total: number;
  pagina: number;
  por_pagina: number;
  usuarios: UsuarioLista[];
}

export interface UsuarioLista {
  id: number;
  empresa_id: number;
  cargo_id: number | null;
  email: string;
  activo: boolean;
  ultimo_login?: string | null;
  fecha_creacion: string;
  empresa_nombre?: string | null;
  cargo_nombre?: string | null;
}

export interface UsuarioCrear {
  email: string;
  contrasena: string;
  cargo_id?: number | null;
  empresa_id?: number | null;
}

export interface PaginatedEmpresas {
  total: number;
  pagina: number;
  por_pagina: number;
  empresas: Empresa[];
}

export interface Empresa {
  id: number;
  codigo: string;
  nombre: string;
  rut: string | null;
  esta_activa: boolean;
  es_empresa_maestra?: boolean;
  creado_at: string;
  empresa_nombre?: string | null;
}

export interface EmpresaCrear {
  codigo: string;
  nombre: string;
  rut?: string | null;
}

export interface EmpresaActualizar {
  nombre?: string;
  rut?: string | null;
  esta_activa?: boolean;
}

export interface UnidadMedidaCrear {
  codigo: string;
  nombre: string;
  activo: number;
  empresa_id?: number;
}

export interface UnidadMedidaActualizar {
  codigo?: string;
  nombre?: string;
  activo?: number;
}

export interface HealthStatus {
  status: string;
  app: string;
  version: string;
}

export interface PaginatedCargos {
  total: number;
  pagina: number;
  por_pagina: number;
  cargos: Cargo[];
}

export interface Cargo {
  id: number;
  nombre: string;
  empresa_id?: number;
  empresa_nombre?: string | null;
}

export interface CargoCrear {
  nombre: string;
  empresa_id?: number;
}

export interface CargoActualizar {
  nombre?: string;
}

export interface PaginatedRoles {
  total: number;
  pagina: number;
  por_pagina: number;
  roles: Rol[];
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  empresa_id?: number;
  empresa_nombre?: string | null;
}

export interface RolCrear {
  nombre: string;
  descripcion: string;
  activo?: number;
  empresa_id?: number;
}

export interface RolActualizar {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
}

export interface Permiso {
  id: number;
  empresa_id: number;
  empresa_nombre?: string | null;
  codigo: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface PaginatedPermisosCargo {
  total: number;
  pagina: number;
  por_pagina: number;
  permisos_cargo: PermisoCargo[];
}

export interface PermisoCargo {
  cargo_id: number;
  rol_id: number;
  activo: boolean;
  cargo_nombre?: string;
  rol_nombre?: string;
  empresa_id?: number;
  empresa_nombre?: string | null;
}

export interface PermisoCargoCrear {
  cargo_id: number;
  rol_id: number;
  activo?: number;
}

export interface PermisoCargoActualizar {
  activo?: number;
}

export interface PaginatedTiposZona {
  total: number;
  pagina: number;
  por_pagina: number;
  tipos_zona: TipoZona[];
}

export interface TipoZona {
  id: number;
  nombre: string;
  activo?: number | boolean;
  empresa_id?: number;
  empresa_nombre?: string | null;
}

export interface TipoZonaCrear {
  nombre: string;
}

export interface TipoZonaActualizar {
  nombre?: string;
  activo?: number;
}

export interface PaginatedZonasBodega {
  total: number;
  pagina: number;
  por_pagina: number;
  zonas_bodega: ZonaBodega[];
}

export interface ZonaBodega {
  id: number;
  bodega_id: number;
  bodega_nombre?: string | null;
  tipo_zona_id: number;
  tipo_zona_nombre?: string | null;
  nombre?: string | null;
  activo?: number | boolean;
  empresa_id?: number;
  empresa_nombre?: string | null;
}

export interface ZonaBodegaCrear {
  bodega_id: number;
  tipo_zona_id: number;
  nombre?: string | null;
  activo?: number;
}

export interface ZonaBodegaActualizar {
  bodega_id?: number;
  tipo_zona_id?: number;
  nombre?: string | null;
  activo?: number;
}

export interface StockZonaItem {
  zona_bodega_id: number;
  zona_nombre: string;
  bodega_id: number;
  bodega_nombre?: string | null;
  tipo_zona_nombre?: string | null;
  producto_id: number;
  producto_sku: string;
  producto_nombre: string;
  unidad_medida_nombre?: string | null;
  cantidad: number;
}

export interface InventarioHistogramaDia {
  fecha: string;
  recepcion: number;
  traslado: number;
  despacho: number;
  total: number;
}

export interface InventarioStockDistribucionItem {
  id: number;
  etiqueta: string;
  cantidad: number;
  lineas: number;
  porcentaje: number;
}

export interface InventarioStockDistribucion {
  nivel: 'bodega' | 'ubicacion';
  bodega_id: number | null;
  total_cantidad: number;
  items: InventarioStockDistribucionItem[];
}

export interface InventarioDashboardResumen {
  lineas_stock: number;
  productos_con_stock: number;
  ubicaciones_con_stock: number;
  movimientos_hoy: number;
  movimientos_semana: number;
  movimientos_por_tipo_semana: Record<string, number>;
  histograma_movimientos: InventarioHistogramaDia[];
  stock_distribucion: InventarioStockDistribucion;
  ultimos_movimientos: MovimientoInventarioItem[];
}

export interface PaginatedStockZona {
  total: number;
  pagina: number;
  por_pagina: number;
  stock: StockZonaItem[];
}

export interface MovimientoInventarioItem {
  id: number;
  tipo: string;
  producto_id: number;
  producto_sku?: string | null;
  producto_nombre?: string | null;
  cantidad: number;
  zona_origen_id?: number | null;
  zona_origen_nombre?: string | null;
  zona_destino_id?: number | null;
  zona_destino_nombre?: string | null;
  documento_tipo?: string | null;
  documento_folio?: string | null;
  observaciones?: string | null;
  usuario_email?: string | null;
  creado_at?: string | null;
}

export interface PaginatedMovimientosInventario {
  total: number;
  pagina: number;
  por_pagina: number;
  movimientos: MovimientoInventarioItem[];
}

export interface InventarioOperacionPayload {
  producto_id: number;
  cantidad: number;
  zona_origen_id: number;
  zona_destino_id: number;
  presentacion_id?: number | null;
  venta_por_presentacion?: boolean;
  documento_tipo?: string | null;
  documento_folio?: string | null;
  observaciones?: string | null;
}

export interface RecepcionPayload {
  bodega_id: number;
  producto_id: number;
  cantidad: number;
  zona_destino_id?: number | null;
  presentacion_id?: number | null;
  venta_por_presentacion?: boolean;
  documento_tipo?: string | null;
  documento_folio?: string | null;
  observaciones?: string | null;
}

export interface BodegaConfigInventario {
  bodega_id: number;
  zona_recepcion_default_id?: number | null;
}
