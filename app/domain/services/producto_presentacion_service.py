"""Servicio de presentaciones comerciales de producto."""
from decimal import Decimal
from typing import Dict, Any
from app.infrastructure.repositories.producto_presentacion_crud_repository import (
    ProductoPresentacionCRUDRepository,
)
from app.infrastructure.repositories.producto_crud_repository import ProductoCRUDRepository
from app.infrastructure.repositories.unidadMedida_crud_repository import UnidadMedidaCRUDRepository
from app.domain.services.inventario_presentacion_service import InventarioPresentacionService


def _serializar_presentacion(p) -> dict:
    return {
        "id": p.id,
        "producto_id": p.producto_id,
        "nombre": p.nombre,
        "cantidad_contenida": float(p.cantidad_contenida),
        "unidad_medida_id": p.unidad_medida_id,
        "unidad_medida_nombre": p.unidad_medida.nombre if p.unidad_medida else None,
        "precio_costo": float(p.precio_costo) if p.precio_costo is not None else None,
        "precio_venta": float(p.precio_venta) if p.precio_venta is not None else None,
        "permite_venta_unidad": p.permite_venta_unidad,
        "permite_venta_presentacion": p.permite_venta_presentacion,
        "activo": p.activo,
    }


class ProductoPresentacionService:
    def __init__(
        self,
        repository: ProductoPresentacionCRUDRepository,
        producto_repository: ProductoCRUDRepository,
        unidad_repository: UnidadMedidaCRUDRepository,
    ):
        self.repository = repository
        self.producto_repository = producto_repository
        self.unidad_repository = unidad_repository
        self.conversion = InventarioPresentacionService()

    async def resolver_empresa_para_producto(
        self,
        producto_id: int,
        empresa_usuario_id: int,
        es_maestra: bool,
        empresas_administradas_ids: list[int],
    ) -> int:
        """
        Empresa real del producto tras validar acceso multi-tenant.
        La empresa maestra puede operar productos de empresas administradas.
        """
        if es_maestra:
            producto = await self.producto_repository.obtener_por_id(producto_id, None)
            if not producto:
                raise ValueError("Producto no encontrado")
            if producto.empresa_id not in empresas_administradas_ids:
                raise ValueError("No autorizado para acceder a este producto")
            return producto.empresa_id

        producto = await self.producto_repository.obtener_por_id(producto_id, empresa_usuario_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        return producto.empresa_id

    async def resolver_empresa_para_presentacion(
        self,
        presentacion_id: int,
        empresa_usuario_id: int,
        es_maestra: bool,
        empresas_administradas_ids: list[int],
    ) -> int:
        empresa_filtro = None if es_maestra else empresa_usuario_id
        presentacion = await self.repository.obtener_por_id(presentacion_id, empresa_filtro)
        if not presentacion:
            raise ValueError("Presentación no encontrada")
        if es_maestra and presentacion.producto.empresa_id not in empresas_administradas_ids:
            raise ValueError("No autorizado para acceder a esta presentación")
        return presentacion.producto.empresa_id

    async def _validar_producto(self, producto_id: int, empresa_id: int):
        producto = await self.producto_repository.obtener_por_id(producto_id, empresa_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        return producto

    async def _validar_unidad(self, unidad_medida_id: int, empresa_id: int):
        unidad = await self.unidad_repository.obtener_por_id(unidad_medida_id, empresa_id)
        if not unidad:
            raise ValueError("Unidad de medida no válida para esta empresa")

    async def listar_presentaciones(
        self,
        producto_id: int,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 50,
        buscar: str | None = None,
    ) -> Dict[str, Any]:
        await self._validar_producto(producto_id, empresa_id)
        items, total = await self.repository.listar_por_producto(
            producto_id, empresa_id, pagina, por_pagina, buscar
        )
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "presentaciones": [_serializar_presentacion(p) for p in items],
        }

    async def crear_presentacion(
        self,
        producto_id: int,
        empresa_id: int,
        nombre: str,
        cantidad_contenida: Decimal,
        unidad_medida_id: int,
        precio_costo: float | None = None,
        precio_venta: float | None = None,
        permite_venta_unidad: bool = True,
        permite_venta_presentacion: bool = True,
    ) -> Dict[str, Any]:
        await self._validar_producto(producto_id, empresa_id)
        await self._validar_unidad(unidad_medida_id, empresa_id)
        if cantidad_contenida <= 0:
            raise ValueError("La cantidad contenida debe ser mayor a cero")
        nombre = nombre.strip()
        if await self.repository.obtener_por_nombre(producto_id, nombre, solo_activas=True):
            raise ValueError(f"Ya existe la presentación '{nombre}' para este producto")

        inactiva = await self.repository.obtener_por_nombre(
            producto_id, nombre, solo_activas=False
        )
        if inactiva is not None and not inactiva.activo:
            reactivada = await self.repository.actualizar(
                inactiva.id,
                empresa_id,
                nombre=nombre,
                cantidad_contenida=cantidad_contenida,
                unidad_medida_id=unidad_medida_id,
                precio_costo=precio_costo,
                precio_venta=precio_venta,
                permite_venta_unidad=permite_venta_unidad,
                permite_venta_presentacion=permite_venta_presentacion,
                activo=True,
            )
            if not reactivada:
                raise ValueError("No se pudo reactivar la presentación")
            return _serializar_presentacion(reactivada)

        nueva = await self.repository.crear(
            producto_id,
            nombre,
            cantidad_contenida,
            unidad_medida_id,
            precio_costo,
            precio_venta,
            permite_venta_unidad,
            permite_venta_presentacion,
        )
        refreshed = await self.repository.obtener_por_id(nueva.id, empresa_id)
        return _serializar_presentacion(refreshed)

    async def actualizar_presentacion(
        self,
        presentacion_id: int,
        empresa_id: int,
        **datos,
    ) -> Dict[str, Any]:
        presentacion = await self.repository.obtener_por_id(presentacion_id, empresa_id)
        if not presentacion:
            raise ValueError("Presentación no encontrada")
        if datos.get("nombre"):
            datos["nombre"] = datos["nombre"].strip()
            existente = await self.repository.obtener_por_nombre(
                presentacion.producto_id, datos["nombre"]
            )
            if existente and existente.id != presentacion_id:
                raise ValueError(f"Ya existe la presentación '{datos['nombre']}'")
        if datos.get("unidad_medida_id") is not None:
            await self._validar_unidad(datos["unidad_medida_id"], empresa_id)
        if datos.get("cantidad_contenida") is not None and datos["cantidad_contenida"] <= 0:
            raise ValueError("La cantidad contenida debe ser mayor a cero")
        for flag in ("permite_venta_unidad", "permite_venta_presentacion", "activo"):
            if flag in datos and datos[flag] is not None:
                datos[flag] = bool(datos[flag])
        actualizada = await self.repository.actualizar(presentacion_id, empresa_id, **datos)
        if not actualizada:
            raise ValueError("Presentación no encontrada")
        return _serializar_presentacion(actualizada)

    async def eliminar_presentacion(
        self, presentacion_id: int, empresa_id: int
    ) -> Dict[str, Any]:
        presentacion = await self.repository.obtener_por_id(presentacion_id, empresa_id)
        if not presentacion:
            raise ValueError("Presentación no encontrada")
        ok = await self.repository.eliminar(presentacion_id, empresa_id)
        if not ok:
            raise ValueError("Error al eliminar presentación")
        return {
            "mensaje": f"Presentación '{presentacion.nombre}' eliminada",
            "presentacion_id": presentacion_id,
        }

    async def calcular_descuento_stock(
        self,
        presentacion_id: int,
        empresa_id: int,
        cantidad: Decimal,
        venta_por_presentacion: bool,
    ) -> Dict[str, Any]:
        presentacion = await self.repository.obtener_por_id(presentacion_id, empresa_id)
        if not presentacion:
            raise ValueError("Presentación no encontrada")
        descuento = self.conversion.calcular_descuento_stock_base(
            cantidad=cantidad,
            cantidad_contenida=Decimal(str(presentacion.cantidad_contenida)),
            venta_por_presentacion=venta_por_presentacion,
            permite_venta_unidad=bool(presentacion.permite_venta_unidad),
            permite_venta_presentacion=bool(presentacion.permite_venta_presentacion),
        )
        return {
            "presentacion_id": presentacion_id,
            "producto_id": presentacion.producto_id,
            "cantidad_vendida": float(cantidad),
            "venta_por_presentacion": venta_por_presentacion,
            "descuento_unidades_base": float(descuento),
            "unidad_base_producto_id": presentacion.producto.unidad_medida_id,
        }
