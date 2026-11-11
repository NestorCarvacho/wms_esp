"""El mapeo ORM no debe disparar lazy load de empresa."""
from sqlalchemy.orm import attributes

from app.infrastructure.models.usuario import Empresa, Producto, TipoProducto, UnidadMedida
from app.modules.catalog.infrastructure.orm_mappers import (
    producto_desde_orm,
    tipo_producto_desde_orm,
    unidad_medida_desde_orm,
)


def test_producto_sin_relacion_cargada_no_consulta_empresa():
    row = Producto(
        id=1,
        empresa_id=1,
        nombre="Tornillo",
        sku="SKU-1",
        activo=True,
        unidad_medida_id=3,
        serializado=False,
    )
    producto = producto_desde_orm(row)
    assert producto.empresa_nombre is None
    assert producto.unidad_medida_nombre is None
    assert producto.tipo_producto_nombre is None
    assert producto.nombre == "Tornillo"
    assert producto.sku == "SKU-1"


def test_producto_usa_empresa_si_ya_esta_cargada():
    row = Producto(
        id=1,
        empresa_id=1,
        nombre="Tornillo",
        sku="SKU-1",
        activo=True,
        unidad_medida_id=3,
        serializado=False,
    )
    attributes.set_committed_value(
        row,
        "empresa",
        Empresa(id=1, codigo="EMP001", razon_social="Acme"),
    )
    producto = producto_desde_orm(row)
    assert producto.empresa_nombre == "EMP001 — Acme"


def test_tipo_y_unidad_sin_relacion_cargada():
    tipo = tipo_producto_desde_orm(
        TipoProducto(id=2, empresa_id=1, nombre="Fijaciones", activo=True)
    )
    unidad = unidad_medida_desde_orm(
        UnidadMedida(id=3, empresa_id=1, nombre="Unidad", codigo="UN", activo=True)
    )
    assert tipo.empresa_nombre is None
    assert tipo.nombre == "Fijaciones"
    assert unidad.empresa_nombre is None
    assert unidad.codigo == "UN"
