"""
Punto de entrada de la aplicación FastAPI.
Configuración de la app, middlewares, y rutas.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from app.core.config import APP_NAME, APP_TAGLINE, APP_VERSION, CORS_ORIGINS, DEBUG
from app.api.v1.endpoints import auth, bodegas, productos, unidadesMedidas, usuarios, empresas, cargos, roles, perfil_usuario, permiso_cargo, permisos, rol_permiso, tipo_zona, zona_bodega, tipo_producto, producto_presentacion, inventario, geografia

# Crear instancia de FastAPI
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=f"{APP_NAME} API — {APP_TAGLINE}. Sistema de gestión de almacén multi-empresa con autenticación JWT.",
    debug=DEBUG,
    openapi_tags=[
        {
            "name": "Autenticación",
            "description": "Endpoints para login, registro y gestión de tokens JWT",
        },
        {
            "name": "Usuarios",
            "description": "CRUD de usuarios (usuarios asociados a empresas)",
        },
        {
            "name": "Empresas",
            "description": "CRUD de empresas (Empresas multi-tenant)",
        },
        {
            "name": "Cargos",
            "description": "CRUD de cargos (cargos de trabajo)",
        },
        {
            "name": "Roles",
            "description": "CRUD de roles (Roles de usuario con permisos específicos)",
        },
        {
            "name": "Bodegas",
            "description": "CRUD de bodegas (Bodegas asociadas a empresas)",
        },
        {
            "name": "Productos",
            "description": "CRUD de productos (Productos asociados a empresas)",
        },
        {
            "name": "Inventario",
            "description": "Stock por zona, recepciones, traslados y despachos",
        },
        {
            "name": "Órdenes",
            "description": "Órdenes de compra y venta (próximamente)",
        },
        {
            "name": "Status",
            "description": "Endpoints de salud y estado de la API",
        },
        {
            "name": "Unidades de Medida",
            "description": "Unidades de medida asociadas a empresas (CRUD completo)",
        },
        {
            "name": "Tipos de Zona",
            "description": "Tipos de zona por empresa (picking, recepción, etc.)",
        },
        {
            "name": "Zonas de Bodega",
            "description": "Zonas dentro de cada bodega",
        },
    ]
)

# ============ MIDDLEWARES ============
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ RUTAS ============
# Autenticación
app.include_router(auth.router)

# Usuarios
app.include_router(usuarios.router)

# Perfil de usuario
app.include_router(perfil_usuario.router)

# Empresas
app.include_router(empresas.router)

# Cargos
app.include_router(cargos.router)

# Roles
app.include_router(roles.router)

# Permisos cargo (cargo_rol)
app.include_router(permiso_cargo.router)

# Permisos atómicos y rol_permiso
app.include_router(permisos.router)
app.include_router(rol_permiso.router)

# Bodegas
app.include_router(bodegas.router)

# Productos
app.include_router(productos.router)

# Unidades de medida
app.include_router(unidadesMedidas.router)

# Tipos de zona y zonas de bodega
app.include_router(tipo_zona.router)
app.include_router(zona_bodega.router)

# Tipos de producto y presentaciones
app.include_router(tipo_producto.router)
app.include_router(producto_presentacion.router)

app.include_router(inventario.router)
app.include_router(geografia.router)

# TODO: Agregar routers de:
# - Órdenes
# - log_auditoria;
# - movimiento_stock;
# - inventario;
# - perfil_usuario;
# - permiso_cargo;
# - estado_orden;
# - estado_inventario;
# - movimiento_stock;


# ============ HEALTH CHECK ============
@app.get("/health", tags=["Status"])
async def health_check():
    """Endpoint de verificación de disponibilidad."""
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "app": APP_NAME,
            "version": APP_VERSION
        }
    )


@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz con información de la API."""
    return JSONResponse(
        status_code=200,
        content={
            "mensaje": f"Bienvenido a {APP_NAME}",
            "version": APP_VERSION,
            "docs": "/docs",
            "redoc": "/redoc"
        }
    )


# ============ MANEJO DE ERRORES GLOBAL ============
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Manejador global de excepciones."""
    return JSONResponse(
        status_code=500,
        content={
            "exito": False,
            "mensaje": "Error interno del servidor",
            "errores": [str(exc)] if DEBUG else []
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG
    )
