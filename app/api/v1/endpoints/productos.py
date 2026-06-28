"""
Endpoints CRUD de Productos (Capa de Presentación).
5 endpoints: GET (listar), GET (detalle), POST (crear), PUT (actualizar), DELETE (eliminar).
Multi-tenant con soporte para super admin.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from io import BytesIO
from app.infrastructure.database import get_db_session
from app.infrastructure.repositories.producto_crud_repository import ProductoCRUDRepository
from app.domain.services.producto_service import ProductoService
from app.domain.services.producto_importacion_service import ProductoImportacionService
from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso, es_super_admin
from app.api.v1.empresa_contexto import ContextoEmpresa, kwargs_listado, obtener_contexto_empresa, resolver_empresa_creacion, contexto_requiere_permiso
from app.api.v1.listado_query import orden_listado
from app.schemas.producto import (
    ProductoCrearDTO,
    ProductoActualizarDTO,
    ProductoRespuestaDTO,
    ProductoListaDTO,
    RespuestaAPIDTO
)


router = APIRouter(prefix="/api/v1/productos", tags=["Productos"])


# ============ DEPENDENCIAS ============
async def obtener_producto_service(session: AsyncSession = Depends(get_db_session)) -> ProductoService:
    """Factory para instanciar el servicio de productos."""
    repository = ProductoCRUDRepository(session)
    return ProductoService(repository)


async def obtener_importacion_service(session: AsyncSession = Depends(get_db_session)) -> ProductoImportacionService:
    return ProductoImportacionService(session)


# ============ GET: LISTAR BODEGAS (CON PAGINACIÓN) ============
@router.get(
    "",
    response_model=RespuestaAPIDTO,
    summary="Listar productos con paginación",
    status_code=status.HTTP_200_OK
)
async def listar_Productos(
    pagina: int = 1,
    por_pagina: int = 10,
    buscar: str | None = None,
    unidad_medida_id: int | None = Query(None, description="Filtrar por unidad de medida"),
    tipo_producto_id: int | None = Query(None, description="Filtrar por tipo de producto"),
    orden_params: dict = Depends(orden_listado),
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("productos.leer")),
    service: ProductoService = Depends(obtener_producto_service)
):
    """
    Obtiene la lista de productos.
    
    **Comportamiento multi-tenant:**
    - Super admin (empresa_id=1): Ve TODOS las productos de todas las empresas
    - Usuario normal: Ve solo productos de su empresa
    
    **Parámetros:**
    - pagina: Número de página (por defecto 1)
    - por_pagina: Productos por página (por defecto 10)
    
    **Respuesta:**
    - Retorna lista paginada de productos
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        resultado = await service.listar_productos(
            empresa_id=ctx.empresa_usuario_id,
            pagina=pagina,
            por_pagina=por_pagina,
            buscar=buscar,
            unidad_medida_id=unidad_medida_id,
            tipo_producto_id=tipo_producto_id,
            **kwargs_listado(ctx),
            **orden_params,
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=f"Se encontraron {resultado['total']} productos"
        ).dict()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ PLANTILLA E IMPORTACIÓN MASIVA ============
@router.get(
    "/plantilla-importacion",
    summary="Descargar plantilla Excel para importación de productos",
    status_code=status.HTTP_200_OK,
)
async def descargar_plantilla_importacion(
    usuario_autenticado: dict = Depends(requiere_permiso("productos.importar")),
    service: ProductoImportacionService = Depends(obtener_importacion_service)
):
    """
    Genera un Excel con:
    - Hoja **Productos**: sku, nombre, id_tipo_producto, unidad_base, precio_costo
    - Hoja **Unidades_medida**: IDs de unidades activas de la empresa (JWT)
    - Hoja **Tipos_producto**: IDs de tipos de producto de la empresa (JWT)
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        contenido = await service.generar_plantilla(empresa_id)
        return StreamingResponse(
            BytesIO(contenido),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": 'attachment; filename="plantilla_productos.xlsx"',
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post(
    "/importacion",
    response_model=RespuestaAPIDTO,
    summary="Importar productos desde Excel",
    status_code=status.HTTP_200_OK,
)
async def importar_productos(
    archivo: UploadFile = File(...),
    usuario_autenticado: dict = Depends(requiere_permiso("productos.importar")),
    service: ProductoImportacionService = Depends(obtener_importacion_service),
):
    """
    Importa productos de la hoja **Productos**.
    `empresa_id` y `activo` se toman del JWT (empresa del usuario).
    """
    try:
        if not archivo.filename or not archivo.filename.lower().endswith((".xlsx", ".xlsm")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo debe ser Excel (.xlsx)",
            )
        contenido = await archivo.read()
        if not contenido:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo está vacío",
            )
        empresa_id = usuario_autenticado.get("empresa_id")
        resultado = await service.importar_desde_excel(contenido, empresa_id)
        mensaje = f"Importación completada: {resultado['creados']} creados"
        if resultado["con_errores"]:
            mensaje += f", {resultado['con_errores']} filas con errores"
        return RespuestaAPIDTO(
            exito=True,
            datos=resultado,
            mensaje=mensaje,
        ).dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


# ============ GET: OBTENER PRODUCTO POR ID ============
@router.get(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Obtener producto por ID",
    status_code=status.HTTP_200_OK
)
async def obtener_producto(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("productos.leer")),
    es_admin: bool = Depends(es_super_admin),
    service: ProductoService = Depends(obtener_producto_service),
):
    """
    Obtiene los datos de una producto específica.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede obtener cualquier producto
    - Usuario normal: Solo puede ver productos de su empresa
    
    **Parámetros:**
    - id: ID de la producto a recuperar
    
    **Respuesta:**
    - Datos completos de la producto
    
    **Permisos:**
    - Requiere autenticación JWT
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        
        # Si es super admin, obtener sin filtro de empresa
        producto_empresa_id = None if es_admin else empresa_id
        producto = await service.obtener_producto(id, producto_empresa_id)
        
        # Validar permisos si no es super admin
        if not es_admin and producto["empresa_id"] != empresa_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para acceder a productos de otras empresas"
            )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=producto,
            mensaje="Producto recuperada exitosamente"
        ).dict()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ POST: CREAR BODEGA ============
@router.post(
    "",
    response_model=RespuestaAPIDTO,
    summary="Crear nueva producto",
    status_code=status.HTTP_201_CREATED
)
async def crear_producto(
    producto_dto: ProductoCrearDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("productos.crear")),
    session: AsyncSession = Depends(get_db_session),
    service: ProductoService = Depends(obtener_producto_service),
):
    """
    Crea un nueva producto en la empresa.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede crear productos en cualquier empresa (especificar en otro contexto)
    - Usuario normal: Solo puede crear en su propia empresa
    
    **Body:**
    - nombre: Nombre de la producto (1-100 caracteres, requerido)
    - sku: Código de la producto (1-50 caracteres, requerido)
    - activo: Estado de la producto (booleano, opcional, por defecto True
    
    **Respuesta:**
    - Datos de la producto creada (status 201 Created)
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo crea en su empresa
    - Super admin puede crear en cualquier empresa
    
    **Validaciones:**
    - Nombre no vacío (1-100 caracteres)
    - Nombre único por empresa
    """
    try:
        empresa_id = await resolver_empresa_creacion(
            usuario_autenticado, producto_dto.empresa_id, session
        )
        
        nueva_producto = await service.crear_producto(
            empresa_id=empresa_id,
            nombre=producto_dto.nombre,
            sku=producto_dto.sku,
            activo=producto_dto.activo,
            unidad_medida_id=producto_dto.unidad_medida_id,
            tipo_producto_id=producto_dto.tipo_producto_id,
            precio_costo=producto_dto.precio_costo,
            serializado=producto_dto.serializado or False,
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=nueva_producto,
            mensaje="Producto creada exitosamente"
        ).dict()
    except ValueError as e:
        error_msg = str(e)
        if "duplicado" in error_msg.lower() or "ya existe" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ PUT: ACTUALIZAR BODEGA ============
@router.put(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Actualizar producto",
    status_code=status.HTTP_200_OK
)
async def actualizar_producto(
    id: int,
    actualizar_dto: ProductoActualizarDTO,
    usuario_autenticado: dict = Depends(requiere_permiso("productos.editar")),
    es_admin: bool = Depends(es_super_admin),
    service: ProductoService = Depends(obtener_producto_service),
):
    """
    Actualiza los datos de una producto existente.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede actualizar cualquier producto
    - Usuario normal: Solo puede actualizar productos de su empresa
    
    **Parámetros:**
    - id: ID de la producto a actualizar
    
    **Body (todos los campos opcionales):**
    - nombre: Nuevo nombre de la producto (1-100 caracteres)
    - sku: Nuevo código de la producto (1-50 caracteres)
    - activo: Nuevo estado de la producto (booleano)
    
    **Respuesta:**
    - Datos de la producto actualizada
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo actualiza en su empresa
    - Super admin puede actualizar en cualquier empresa
    
    **Validaciones:**
    - Nombre único por empresa si se actualiza
    - Producto debe existir
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")

        producto_empresa_id = None if es_admin else empresa_id
        producto_ref = await service.obtener_producto(id, producto_empresa_id)
        if not es_admin and producto_ref["empresa_id"] != empresa_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para editar productos de otras empresas",
            )
        empresa_id_operacion = producto_ref["empresa_id"]

        campos_enviados = getattr(actualizar_dto, "model_fields_set", None) or getattr(
            actualizar_dto, "__fields_set__", set()
        )
        actualizar_tipo_producto = "tipo_producto_id" in campos_enviados

        producto_actualizada = await service.actualizar_producto(
            producto_id=id,
            empresa_id=empresa_id_operacion,
            nombre=actualizar_dto.nombre,
            sku=actualizar_dto.sku,
            activo=bool(actualizar_dto.activo) if actualizar_dto.activo is not None else None,
            unidad_medida_id=actualizar_dto.unidad_medida_id,
            tipo_producto_id=actualizar_dto.tipo_producto_id,
            actualizar_tipo_producto=actualizar_tipo_producto,
            precio_costo=actualizar_dto.precio_costo,
            serializado=actualizar_dto.serializado,
        )
        
        return RespuestaAPIDTO(
            exito=True,
            datos=producto_actualizada,
            mensaje="Producto actualizada exitosamente"
        ).dict()
    except ValueError as e:
        error_msg = str(e)
        if "no encontrad" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        if "duplicado" in error_msg.lower() or "ya existe" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ DELETE: ELIMINAR BODEGA ============
@router.delete(
    "/{id}",
    response_model=RespuestaAPIDTO,
    summary="Eliminar producto",
    status_code=status.HTTP_200_OK
)
async def eliminar_producto(
    id: int,
    usuario_autenticado: dict = Depends(requiere_permiso("productos.eliminar")),
    es_admin: bool = Depends(es_super_admin),
    service: ProductoService = Depends(obtener_producto_service),
):
    """
    Elimina una producto.
    
    **Comportamiento multi-tenant:**
    - Super admin: Puede eliminar cualquier producto
    - Usuario normal: Solo puede eliminar productos de su empresa
    
    **Parámetros:**
    - id: ID de la producto a eliminar
    
    **Respuesta:**
    - Confirmación de eliminación
    
    **Permisos:**
    - Requiere autenticación JWT
    - Usuario normal solo elimina en su empresa
    - Super admin puede eliminar en cualquier empresa
    
    **Validaciones:**
    - Producto debe existir
    """
    try:
        empresa_id = usuario_autenticado.get("empresa_id")
        producto_empresa_id = None if es_admin else empresa_id
        producto_ref = await service.obtener_producto(id, producto_empresa_id)
        if not es_admin and producto_ref["empresa_id"] != empresa_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permiso para eliminar productos de otras empresas",
            )

        resultado = await service.eliminar_producto(id, producto_ref["empresa_id"])
        
        return RespuestaAPIDTO(
            exito=True,
            datos={"mensaje": resultado["mensaje"]},
            mensaje="Producto eliminada exitosamente"
        ).dict()
    except ValueError as e:
        error_msg = str(e)
        if "no encontrado" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
