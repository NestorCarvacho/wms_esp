"""Validación de filas importadas y consultas de duplicados en BD."""
from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Any

from app.modules.catalog.domain.ports import IProductoRepository
from app.modules.catalog.infrastructure.producto_importacion_parser import ProductoImportacionParser
from app.modules.catalog.infrastructure.producto_presentacion_crud import (
    ProductoPresentacionCRUDRepository,
)

MAX_FILAS = 2000
MAX_PRESENTACIONES = 5000


class ProductoImportacionValidador:
    def __init__(
        self,
        producto_repo: IProductoRepository,
        presentacion_repo: ProductoPresentacionCRUDRepository,
        parser: ProductoImportacionParser | None = None,
    ):
        self.producto_repo = producto_repo
        self.presentacion_repo = presentacion_repo
        self.parser = parser or ProductoImportacionParser()

    async def cargar_existentes(self, empresa_id: int) -> tuple[set[str], set[str]]:
        return await self.producto_repo.listar_skus_y_nombres_empresa(empresa_id)

    async def cargar_barcodes_existentes(self, empresa_id: int) -> set[str]:
        return await self.producto_repo.listar_codigos_barras_empresa(empresa_id)

    async def mapa_skus_empresa(self, empresa_id: int, skus: set[str]) -> dict[str, int]:
        return await self.producto_repo.mapa_ids_por_skus(empresa_id, skus)

    def validar_filas_productos(
        self,
        filas: list[dict[str, Any]],
        empresa_id: int,
        unidades_validas: set[int],
        tipos_validos: set[int],
        skus_bd: set[str],
        nombres_bd: set[str],
        barcodes_bd: set[str],
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        skus_archivo: set[str] = set()
        nombres_archivo: set[str] = set()
        barcodes_archivo: set[str] = set()
        validos: list[dict[str, Any]] = []
        errores: list[dict[str, Any]] = []

        for fila in filas:
            numero = fila["fila"]
            sku = fila.get("sku", "")
            nombre = fila.get("nombre", "")
            unidad_raw = fila.get("unidad_medida_id")
            tipo_raw = fila.get("tipo_producto_id")
            precio_raw = fila.get("precio_costo")
            codigo_barras = self.parser._celda_texto(fila.get("codigo_barras"))
            serializado_raw = fila.get("serializado")

            errores_fila: list[str] = []

            if not sku:
                errores_fila.append("sku es obligatorio")
            elif len(sku) > 100:
                errores_fila.append("sku no puede superar 100 caracteres")
            elif sku in skus_archivo:
                errores_fila.append(f"sku '{sku}' duplicado en el archivo")
            elif sku in skus_bd:
                errores_fila.append(f"sku '{sku}' ya existe en la empresa")

            if not nombre:
                errores_fila.append("nombre es obligatorio")
            elif len(nombre) > 255:
                errores_fila.append("nombre no puede superar 255 caracteres")
            elif nombre in nombres_archivo:
                errores_fila.append(f"nombre '{nombre}' duplicado en el archivo")
            elif nombre in nombres_bd:
                errores_fila.append(f"nombre '{nombre}' ya existe en la empresa")

            unidad_id: int | None = None
            if unidad_raw is None or str(unidad_raw).strip() == "":
                errores_fila.append("unidad_base (unidad_medida_id) es obligatorio")
            else:
                try:
                    unidad_id = int(float(unidad_raw))
                    if unidad_id not in unidades_validas:
                        errores_fila.append(
                            f"unidad_base {unidad_id} no existe o no pertenece a su empresa"
                        )
                except (TypeError, ValueError):
                    errores_fila.append("unidad_base debe ser un número entero (ID de Unidades_medida)")

            tipo_producto_id: int | None = None
            if tipo_raw is not None and str(tipo_raw).strip() != "":
                try:
                    tipo_producto_id = int(float(tipo_raw))
                    if tipo_producto_id not in tipos_validos:
                        errores_fila.append(
                            f"id_tipo_producto {tipo_producto_id} no existe o no pertenece a su empresa"
                        )
                except (TypeError, ValueError):
                    errores_fila.append("id_tipo_producto debe ser un número entero")

            precio_costo: float | None = None
            if precio_raw is not None and str(precio_raw).strip() != "":
                try:
                    precio_costo = float(Decimal(str(precio_raw)))
                    if precio_costo < 0:
                        errores_fila.append("precio_costo no puede ser negativo")
                except (InvalidOperation, ValueError):
                    errores_fila.append("precio_costo debe ser un número válido")

            serializado = False
            if serializado_raw is not None and str(serializado_raw).strip() != "":
                txt = str(serializado_raw).strip().lower()
                if txt in ("1", "true", "si", "sí", "yes"):
                    serializado = True
                elif txt in ("0", "false", "no"):
                    serializado = False
                else:
                    errores_fila.append("serializado debe ser 0 o 1")

            if codigo_barras:
                if len(codigo_barras) > 100:
                    errores_fila.append("codigo_barras no puede superar 100 caracteres")
                elif codigo_barras in barcodes_archivo:
                    errores_fila.append(f"codigo_barras '{codigo_barras}' duplicado en el archivo")
                elif codigo_barras in barcodes_bd:
                    errores_fila.append(f"codigo_barras '{codigo_barras}' ya existe en la empresa")

            if errores_fila:
                errores.append({"fila": numero, "sku": sku or None, "errores": errores_fila})
                continue

            if codigo_barras:
                barcodes_archivo.add(codigo_barras)

            skus_archivo.add(sku)
            nombres_archivo.add(nombre)
            validos.append(
                {
                    "fila": numero,
                    "empresa_id": empresa_id,
                    "sku": sku,
                    "nombre": nombre,
                    "unidad_medida_id": unidad_id,
                    "tipo_producto_id": tipo_producto_id,
                    "precio_costo": precio_costo,
                    "serializado": serializado,
                    "codigo_barras": codigo_barras or None,
                    "activo": True,
                }
            )

        return validos, errores

    async def validar_presentaciones(
        self,
        filas: list[dict[str, Any]],
        mapa_skus: dict[str, int],
        barcodes_ocupados: set[str],
        empresa_id: int,
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        validas: list[dict[str, Any]] = []
        errores: list[dict[str, Any]] = []
        barcodes_en_archivo: set[str] = set()

        for fila in filas:
            numero = fila["fila"]
            sku = self.parser._celda_texto(fila.get("sku"))
            nombre_pres = self.parser._celda_texto(fila.get("nombre_presentacion"))
            codigo = self.parser._celda_texto(fila.get("codigo_barras"))
            cant_raw = fila.get("cantidad_contenida")
            pv_raw = fila.get("precio_venta")
            pc_raw = fila.get("precio_costo")

            errores_fila: list[str] = []

            if not sku:
                errores_fila.append("sku es obligatorio")
            elif sku not in mapa_skus:
                errores_fila.append(f"sku '{sku}' no existe (créelo en Productos o importe antes)")

            if not nombre_pres:
                errores_fila.append("nombre_presentacion es obligatorio")
            if not codigo:
                errores_fila.append("codigo_barras es obligatorio")
            elif codigo in barcodes_en_archivo:
                errores_fila.append(f"codigo_barras '{codigo}' duplicado en el archivo")
            elif codigo in barcodes_ocupados:
                errores_fila.append(f"codigo_barras '{codigo}' ya existe en la empresa")

            cantidad: Decimal | None = None
            if cant_raw is None or str(cant_raw).strip() == "":
                errores_fila.append("cantidad_contenida es obligatoria")
            else:
                try:
                    cantidad = Decimal(str(cant_raw))
                    if cantidad <= 0:
                        errores_fila.append("cantidad_contenida debe ser mayor a cero")
                except (InvalidOperation, ValueError):
                    errores_fila.append("cantidad_contenida debe ser un número válido")

            precio_venta: float | None = None
            if pv_raw is not None and str(pv_raw).strip() != "":
                try:
                    precio_venta = float(Decimal(str(pv_raw)))
                    if precio_venta < 0:
                        errores_fila.append("precio_venta no puede ser negativo")
                except (InvalidOperation, ValueError):
                    errores_fila.append("precio_venta debe ser un número válido")

            precio_costo: float | None = None
            if pc_raw is not None and str(pc_raw).strip() != "":
                try:
                    precio_costo = float(Decimal(str(pc_raw)))
                    if precio_costo < 0:
                        errores_fila.append("precio_costo no puede ser negativo")
                except (InvalidOperation, ValueError):
                    errores_fila.append("precio_costo debe ser un número válido")

            if errores_fila:
                errores.append({"fila": numero, "sku": sku or None, "errores": errores_fila})
                continue

            barcodes_en_archivo.add(codigo)
            producto_id = mapa_skus[sku]
            producto = await self.producto_repo.obtener_por_id(producto_id, empresa_id)
            if not producto:
                errores.append({"fila": numero, "sku": sku, "errores": ["Producto no encontrado"]})
                continue

            if await self.presentacion_repo.obtener_por_nombre(producto_id, nombre_pres, solo_activas=True):
                errores.append(
                    {
                        "fila": numero,
                        "sku": sku,
                        "errores": [f"Ya existe la presentación '{nombre_pres}' para este producto"],
                    }
                )
                continue

            validas.append(
                {
                    "producto_id": producto_id,
                    "unidad_medida_id": producto.unidad_medida_id,
                    "nombre": nombre_pres,
                    "codigo_barras": codigo,
                    "cantidad_contenida": cantidad,
                    "precio_venta": precio_venta,
                    "precio_costo": precio_costo,
                }
            )

        return validas, errores
