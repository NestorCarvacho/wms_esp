"""Conversión entre presentaciones comerciales y unidades base de inventario."""
from decimal import Decimal


class PresentacionConverter:
    """
    El inventario se mantiene en unidades base del producto (producto.unidad_medida_id).
    """

    def calcular_descuento_stock_base(
        self,
        cantidad: Decimal,
        cantidad_contenida: Decimal,
        venta_por_presentacion: bool,
        permite_venta_unidad: bool,
        permite_venta_presentacion: bool,
    ) -> Decimal:
        if cantidad <= 0:
            raise ValueError("La cantidad debe ser mayor a cero")
        if cantidad_contenida <= 0:
            raise ValueError("La presentación no tiene cantidad contenida válida")

        if venta_por_presentacion:
            if not permite_venta_presentacion:
                raise ValueError("Esta presentación no permite venta por empaque completo")
            return cantidad * cantidad_contenida

        if not permite_venta_unidad:
            raise ValueError("Esta presentación no permite venta por unidad")
        return cantidad
