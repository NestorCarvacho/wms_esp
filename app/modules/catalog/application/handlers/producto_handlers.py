"""Handlers CRUD de productos."""
from __future__ import annotations

from typing import Any

from app.modules.catalog.application.commands import ActualizarProductoCommand, CrearProductoCommand
from app.modules.catalog.application.producto_mappers import (
    serializar_producto_detalle,
    serializar_producto_lista,
)
from app.modules.catalog.domain.ports import IProductoRepository


class ListarProductosQueryHandler:
    def __init__(self, repo: IProductoRepository):
        self.repo = repo

    async def handle(self, **kwargs: Any) -> dict:
        pagina = kwargs.get("pagina", 1)
        por_pagina = kwargs.get("por_pagina", 10)
        productos, total = await self.repo.listar(**kwargs)
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "productos": [serializar_producto_lista(p) for p in productos],
        }


class ObtenerProductoQueryHandler:
    def __init__(self, repo: IProductoRepository):
        self.repo = repo

    async def handle(self, producto_id: int, empresa_id: int | None = None) -> dict:
        producto = await self.repo.obtener_por_id(producto_id, empresa_id)
        if not producto:
            raise ValueError("Producto no encontrada")
        return serializar_producto_detalle(producto)


class CrearProductoHandler:
    def __init__(self, repo: IProductoRepository):
        self.repo = repo

    async def handle(self, cmd: CrearProductoCommand) -> dict:
        if not cmd.nombre or not cmd.nombre.strip():
            raise ValueError("El nombre de el producto no puede estar vacío")
        if not cmd.sku or not cmd.sku.strip():
            raise ValueError("El código de el producto no puede estar vacío")

        nombre = cmd.nombre.strip()
        sku = cmd.sku.strip()

        if await self.repo.obtener_por_nombre(nombre, cmd.empresa_id):
            raise ValueError(f"Ya existe una producto con el nombre '{nombre}' en esta empresa")

        nuevo = await self.repo.crear(
            cmd.empresa_id,
            nombre,
            sku,
            cmd.activo,
            cmd.unidad_medida_id,
            cmd.tipo_producto_id,
            cmd.precio_costo,
            serializado=cmd.serializado,
        )
        return serializar_producto_detalle(nuevo)


class ActualizarProductoHandler:
    def __init__(self, repo: IProductoRepository):
        self.repo = repo

    async def handle(self, cmd: ActualizarProductoCommand) -> dict:
        existente = await self.repo.obtener_por_id(cmd.producto_id, cmd.empresa_id)
        if not existente:
            raise ValueError("Producto no encontrada")

        nombre = cmd.nombre
        sku = cmd.sku

        if sku is not None and sku.strip():
            sku = sku.strip()
            otro = await self.repo.obtener_por_sku(sku, cmd.empresa_id)
            if otro and otro.id != cmd.producto_id:
                raise ValueError(f"Ya existe una producto con el código '{sku}' en esta empresa")

        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            otro = await self.repo.obtener_por_nombre(nombre, cmd.empresa_id)
            if otro and otro.id != cmd.producto_id:
                raise ValueError(f"Ya existe una producto con el nombre '{nombre}' en esta empresa")

        activo_efectivo = existente.activo if cmd.activo is None else cmd.activo
        actualizado = await self.repo.actualizar(
            cmd.producto_id,
            cmd.empresa_id,
            nombre,
            sku,
            activo_efectivo,
            cmd.unidad_medida_id,
            cmd.tipo_producto_id,
            cmd.precio_costo,
            actualizar_tipo_producto=cmd.actualizar_tipo_producto,
            serializado=cmd.serializado,
        )
        if not actualizado:
            raise ValueError("Error al actualizar el producto")
        return serializar_producto_detalle(actualizado)


class EliminarProductoHandler:
    def __init__(self, repo: IProductoRepository):
        self.repo = repo

    async def handle(self, producto_id: int, empresa_id: int) -> dict:
        producto = await self.repo.obtener_por_id(producto_id, empresa_id)
        if not producto:
            raise ValueError("Producto no encontrada")
        if not await self.repo.eliminar(producto_id, empresa_id):
            raise ValueError("Error al eliminar el producto")
        return {
            "mensaje": f"Producto '{producto.nombre}' eliminada exitosamente",
            "producto_id": producto_id,
        }
