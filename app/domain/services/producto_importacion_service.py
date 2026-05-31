"""Generación de plantilla e importación masiva de productos desde Excel."""
from __future__ import annotations

from decimal import Decimal, InvalidOperation
from io import BytesIO
from typing import Any

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import Producto
from app.infrastructure.repositories.producto_crud_repository import ProductoCRUDRepository
from app.infrastructure.repositories.unidadMedida_crud_repository import UnidadMedidaCRUDRepository

SHEET_PRODUCTOS = "Productos"
SHEET_UNIDADES = "Unidades_medida"
HEADERS_PRODUCTOS = ["sku", "nombre", "unidad_medida_id", "precio_costo"]
MAX_FILAS = 2000


class ProductoImportacionService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.producto_repo = ProductoCRUDRepository(session)
        self.unidad_repo = UnidadMedidaCRUDRepository(session)

    async def generar_plantilla(self, empresa_id: int) -> bytes:
        unidades, _ = await self.unidad_repo.listar(
            empresa_id=empresa_id,
            pagina=1,
            por_pagina=500,
            es_super_admin=False,
        )

        wb = Workbook()
        ws_prod = wb.active
        ws_prod.title = SHEET_PRODUCTOS
        ws_prod.append(HEADERS_PRODUCTOS)
        self._estilar_encabezado(ws_prod, len(HEADERS_PRODUCTOS))
        ws_prod.append(["", "", "", ""])

        ws_um = wb.create_sheet(SHEET_UNIDADES)
        ws_um.append(["unidad_medida_id", "codigo", "nombre"])
        self._estilar_encabezado(ws_um, 3)
        for u in unidades:
            ws_um.append([u.id, u.codigo, u.nombre])

        instrucciones = wb.create_sheet("Instrucciones")
        instrucciones.append(["Importación masiva de productos"])
        instrucciones.append([])
        instrucciones.append(["1. Complete la hoja 'Productos' con sku, nombre, unidad_medida_id y precio_costo (opcional)."])
        instrucciones.append(["2. Use los IDs de la hoja 'Unidades_medida' de su empresa."])
        instrucciones.append(["3. empresa_id y activo se asignan automáticamente al importar (JWT)."])
        instrucciones.append(["4. No modifique los encabezados de la fila 1."])

        buffer = BytesIO()
        wb.save(buffer)
        return buffer.getvalue()

    def _estilar_encabezado(self, ws, columnas: int) -> None:
        fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
        font = Font(bold=True, color="FFFFFF")
        for col in range(1, columnas + 1):
            cell = ws.cell(row=1, column=col)
            cell.fill = fill
            cell.font = font

    async def importar_desde_excel(self, contenido: bytes, empresa_id: int) -> dict[str, Any]:
        unidades, _ = await self.unidad_repo.listar(
            empresa_id=empresa_id,
            pagina=1,
            por_pagina=500,
            es_super_admin=False,
        )
        unidades_validas = {int(u.id) for u in unidades}

        skus_bd, nombres_bd = await self._cargar_existentes(empresa_id)

        filas = self._parsear_productos(contenido)
        if not filas:
            raise ValueError("No se encontraron filas de productos en la hoja 'Productos'")

        if len(filas) > MAX_FILAS:
            raise ValueError(f"Máximo {MAX_FILAS} productos por archivo")

        skus_archivo: set[str] = set()
        nombres_archivo: set[str] = set()
        validos: list[dict[str, Any]] = []
        errores: list[dict[str, Any]] = []

        for fila in filas:
            numero = fila["fila"]
            sku = fila.get("sku", "")
            nombre = fila.get("nombre", "")
            unidad_raw = fila.get("unidad_medida_id")
            precio_raw = fila.get("precio_costo")

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
                errores_fila.append("unidad_medida_id es obligatorio")
            else:
                try:
                    unidad_id = int(float(unidad_raw))
                except (TypeError, ValueError):
                    errores_fila.append("unidad_medida_id debe ser un número entero")
                else:
                    if unidad_id not in unidades_validas:
                        errores_fila.append(
                            f"unidad_medida_id {unidad_id} no existe o no pertenece a su empresa"
                        )

            precio_costo: float | None = None
            if precio_raw is not None and str(precio_raw).strip() != "":
                try:
                    precio_costo = float(Decimal(str(precio_raw)))
                except (InvalidOperation, ValueError):
                    errores_fila.append("precio_costo debe ser un número válido")
                else:
                    if precio_costo < 0:
                        errores_fila.append("precio_costo no puede ser negativo")

            if errores_fila:
                errores.append({"fila": numero, "sku": sku or None, "errores": errores_fila})
                continue

            skus_archivo.add(sku)
            nombres_archivo.add(nombre)
            validos.append(
                {
                    "fila": numero,
                    "empresa_id": empresa_id,
                    "sku": sku,
                    "nombre": nombre,
                    "unidad_medida_id": unidad_id,
                    "precio_costo": precio_costo,
                    "activo": True,
                }
            )

        creados = 0
        if validos:
            creados = await self.producto_repo.crear_masivo(
                [
                    {
                        "empresa_id": v["empresa_id"],
                        "sku": v["sku"],
                        "nombre": v["nombre"],
                        "unidad_medida_id": v["unidad_medida_id"],
                        "precio_costo": v["precio_costo"],
                        "activo": v["activo"],
                    }
                    for v in validos
                ]
            )

        return {
            "total_filas": len(filas),
            "creados": creados,
            "con_errores": len(errores),
            "errores": errores,
        }

    async def _cargar_existentes(self, empresa_id: int) -> tuple[set[str], set[str]]:
        from sqlalchemy import select

        stmt = select(Producto.sku, Producto.nombre).where(Producto.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        rows = result.all()
        return {r[0] for r in rows if r[0]}, {r[1] for r in rows if r[1]}

    def _parsear_productos(self, contenido: bytes) -> list[dict[str, Any]]:
        wb = load_workbook(BytesIO(contenido), read_only=True, data_only=True)
        if SHEET_PRODUCTOS not in wb.sheetnames:
            raise ValueError(f"Falta la hoja '{SHEET_PRODUCTOS}'")

        ws = wb[SHEET_PRODUCTOS]
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return []

        headers = [self._normalizar_header(h) for h in rows[0]]
        indices = {h: i for i, h in enumerate(headers) if h}

        for required in HEADERS_PRODUCTOS:
            if required not in indices:
                raise ValueError(f"Falta la columna '{required}' en la hoja Productos")

        filas: list[dict[str, Any]] = []
        for row_num, row in enumerate(rows[1:], start=2):
            if not row or all(c is None or str(c).strip() == "" for c in row):
                continue

            def val(key: str):
                idx = indices[key]
                return row[idx] if idx < len(row) else None

            sku = self._celda_texto(val("sku"))
            nombre = self._celda_texto(val("nombre"))
            if not sku and not nombre:
                continue

            filas.append(
                {
                    "fila": row_num,
                    "sku": sku,
                    "nombre": nombre,
                    "unidad_medida_id": val("unidad_medida_id"),
                    "precio_costo": val("precio_costo"),
                }
            )

        wb.close()
        return filas

    @staticmethod
    def _normalizar_header(value) -> str:
        if value is None:
            return ""
        return str(value).strip().lower()

    @staticmethod
    def _celda_texto(value) -> str:
        if value is None:
            return ""
        return str(value).strip()
