"""Conversión entre presentaciones comerciales y unidades base de inventario."""
from decimal import Decimal


class InventarioPresentacionService:
    """
    El inventario se mantiene en unidades base del producto (producto.unidad_medida_id).

    Ejemplo: 10 cajas × 100 clavos = 1.000 unidades base.
    Venta de 15 clavos descuenta 15 unidades base.
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

    def ingreso_presentaciones_a_unidades_base(
        self, cantidad_presentaciones: Decimal, cantidad_contenida: Decimal
    ) -> Decimal:
        """Convierte ingreso de empaques a stock en unidades base."""
        if cantidad_presentaciones <= 0 or cantidad_contenida <= 0:
            raise ValueError("Cantidades inválidas para conversión de ingreso")
        return cantidad_presentaciones * cantidad_contenida

    def unidades_base_a_presentaciones_completas(
        self, stock_base: Decimal, cantidad_contenida: Decimal
    ) -> tuple[Decimal, Decimal]:
        """Devuelve (empaques_completos, unidades_sueltas_restantes)."""
        if cantidad_contenida <= 0:
            raise ValueError("Cantidad contenida inválida")
        empaques = stock_base // cantidad_contenida
        sueltas = stock_base % cantidad_contenida
        return empaques, sueltas
