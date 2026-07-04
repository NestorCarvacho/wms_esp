"""Servicio de inventario serializado (serie_producto)."""
from decimal import Decimal
from typing import Any

from app.infrastructure.repositories.inventario_crud_repository import InventarioCRUDRepository
from app.infrastructure.repositories.serie_producto_crud_repository import SerieProductoCRUDRepository


class SerieProductoService:
    def __init__(
        self,
        serie_repo: SerieProductoCRUDRepository,
        inv_repo: InventarioCRUDRepository,
    ):
        self.serie_repo = serie_repo
        self.inv_repo = inv_repo

    async def _validar_producto_serializado(self, producto_id: int, empresa_id: int):
        producto = await self.inv_repo.obtener_producto(producto_id, empresa_id)
        if not producto:
            raise ValueError("Producto no encontrado")
        if not getattr(producto, "serializado", False):
            raise ValueError("El producto no está configurado como serializado")
        return producto

    async def _resolver_zona_recepcion(self, bodega_id: int, zona_destino_id: int | None, empresa_id: int):
        if zona_destino_id:
            zona = await self.inv_repo.obtener_zona(zona_destino_id, empresa_id)
            if not zona or zona.bodega_id != bodega_id:
                raise ValueError("La zona de destino no pertenece a la bodega indicada")
            return zona
        cfg = await self.inv_repo.get_bodega_config(bodega_id)
        if not cfg or not cfg.zona_recepcion_default_id:
            raise ValueError("Configure la zona de recepción por defecto o indique zona_destino_id")
        zona = await self.inv_repo.obtener_zona(cfg.zona_recepcion_default_id, empresa_id)
        if not zona or zona.bodega_id != bodega_id:
            raise ValueError("La zona de recepción configurada no es válida para esta bodega")
        return zona

    async def recepcionar_serie(
        self,
        empresa_id: int,
        usuario_id: int,
        producto_id: int,
        numero_serie: str,
        bodega_id: int,
        zona_destino_id: int | None = None,
        documento_tipo: str | None = None,
        documento_folio: str | None = None,
        observaciones: str | None = None,
    ) -> dict[str, Any]:
        await self._validar_producto_serializado(producto_id, empresa_id)

        if await self.serie_repo.existe(empresa_id, numero_serie):
            raise ValueError(f"El número de serie '{numero_serie}' ya existe en esta empresa")

        zona = await self._resolver_zona_recepcion(bodega_id, zona_destino_id, empresa_id)

        try:
            serie = await self.serie_repo.crear(empresa_id, producto_id, numero_serie, zona.id)
            await self.inv_repo.ajustar_stock(zona.id, producto_id, Decimal("1"))
            mov = await self.inv_repo.registrar_movimiento({
                "empresa_id": empresa_id,
                "usuario_id": usuario_id,
                "tipo": "RECEPCION",
                "producto_id": producto_id,
                "cantidad": Decimal("1"),
                "presentacion_id": None,
                "venta_por_presentacion": False,
                "serie_id": serie.id,
                "zona_origen_id": None,
                "zona_destino_id": zona.id,
                "documento_tipo": documento_tipo,
                "documento_folio": documento_folio,
                "observaciones": observaciones,
            })
            await self.inv_repo.commit()
            return {
                "serie_id": serie.id,
                "numero_serie": numero_serie,
                "producto_id": producto_id,
                "zona_destino_id": zona.id,
                "movimiento_id": mov.id,
            }
        except Exception:
            await self.inv_repo.rollback()
            raise

    async def trasladar_serie(
        self,
        empresa_id: int,
        usuario_id: int,
        numero_serie: str,
        zona_origen_id: int,
        zona_destino_id: int,
        documento_tipo: str | None = None,
        documento_folio: str | None = None,
        observaciones: str | None = None,
    ) -> dict[str, Any]:
        if zona_origen_id == zona_destino_id:
            raise ValueError("Origen y destino deben ser zonas distintas")

        serie = await self.serie_repo.buscar_por_numero_serie(empresa_id, numero_serie)
        if not serie:
            raise ValueError(f"Número de serie '{numero_serie}' no encontrado")
        if serie.estado != "EN_BODEGA":
            raise ValueError(f"El ítem '{numero_serie}' no está disponible (estado: {serie.estado})")
        if serie.zona_bodega_id != zona_origen_id:
            zona_actual = serie.zona_bodega
            nombre = zona_actual.nombre if zona_actual else str(serie.zona_bodega_id)
            raise ValueError(f"El ítem '{numero_serie}' está en zona '{nombre}', no en la zona origen indicada")

        origen = await self.inv_repo.obtener_zona(zona_origen_id, empresa_id)
        destino = await self.inv_repo.obtener_zona(zona_destino_id, empresa_id)
        if not origen or not destino:
            raise ValueError("Zona origen o destino no válida")
        if origen.bodega_id != destino.bodega_id:
            raise ValueError("El traslado debe ser dentro de la misma bodega")

        try:
            await self.serie_repo.trasladar(serie.id, zona_destino_id)
            await self.inv_repo.ajustar_stock(zona_origen_id, serie.producto_id, Decimal("-1"))
            await self.inv_repo.ajustar_stock(zona_destino_id, serie.producto_id, Decimal("1"))
            mov = await self.inv_repo.registrar_movimiento({
                "empresa_id": empresa_id,
                "usuario_id": usuario_id,
                "tipo": "TRASLADO",
                "producto_id": serie.producto_id,
                "cantidad": Decimal("1"),
                "presentacion_id": None,
                "venta_por_presentacion": False,
                "serie_id": serie.id,
                "zona_origen_id": zona_origen_id,
                "zona_destino_id": zona_destino_id,
                "documento_tipo": documento_tipo,
                "documento_folio": documento_folio,
                "observaciones": observaciones,
            })
            await self.inv_repo.commit()
            return {
                "serie_id": serie.id,
                "numero_serie": numero_serie,
                "producto_id": serie.producto_id,
                "zona_origen_id": zona_origen_id,
                "zona_destino_id": zona_destino_id,
                "movimiento_id": mov.id,
            }
        except Exception:
            await self.inv_repo.rollback()
            raise

    async def despachar_serie(
        self,
        empresa_id: int,
        usuario_id: int,
        numero_serie: str,
        zona_origen_id: int,
        documento_tipo: str | None = None,
        documento_folio: str | None = None,
        observaciones: str | None = None,
    ) -> dict[str, Any]:
        serie = await self.serie_repo.buscar_por_numero_serie(empresa_id, numero_serie)
        if not serie:
            raise ValueError(f"Número de serie '{numero_serie}' no encontrado")
        if serie.estado != "EN_BODEGA":
            raise ValueError(f"El ítem '{numero_serie}' no está disponible (estado: {serie.estado})")
        if serie.zona_bodega_id != zona_origen_id:
            raise ValueError(f"El ítem '{numero_serie}' no se encuentra en la zona origen indicada")

        try:
            await self.serie_repo.despachar(serie.id)
            await self.inv_repo.ajustar_stock(
                zona_origen_id, serie.producto_id, Decimal("-1")
            )
            mov = await self.inv_repo.registrar_movimiento({
                "empresa_id": empresa_id,
                "usuario_id": usuario_id,
                "tipo": "DESPACHO",
                "producto_id": serie.producto_id,
                "cantidad": Decimal("1"),
                "presentacion_id": None,
                "venta_por_presentacion": False,
                "serie_id": serie.id,
                "zona_origen_id": zona_origen_id,
                "zona_destino_id": None,
                "documento_tipo": documento_tipo,
                "documento_folio": documento_folio,
                "observaciones": observaciones,
            })
            await self.inv_repo.commit()

            return {
                "serie_id": serie.id,
                "numero_serie": numero_serie,
                "producto_id": serie.producto_id,
                "zona_origen_id": zona_origen_id,
                "movimiento_id": mov.id,
            }
        except Exception:
            await self.inv_repo.rollback()
            raise

    async def ubicar_serie(self, empresa_id: int, numero_serie: str) -> dict[str, Any]:
        serie = await self.serie_repo.buscar_por_numero_serie(empresa_id, numero_serie)
        if not serie:
            raise ValueError(f"Número de serie '{numero_serie}' no encontrado")
        return self.serie_repo.serializar(serie)

    async def listar_series_producto(
        self,
        empresa_id: int,
        producto_id: int,
        estado: str | None = None,
        zona_bodega_id: int | None = None,
        pagina: int = 1,
        por_pagina: int = 50,
    ) -> dict[str, Any]:
        rows, total = await self.serie_repo.listar_por_producto(
            empresa_id, producto_id, estado, zona_bodega_id, pagina, por_pagina
        )
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "series": [self.serie_repo.serializar(s) for s in rows],
        }
