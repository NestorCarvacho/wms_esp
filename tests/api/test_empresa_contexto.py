"""Tests de verificar_acceso_a_empresa en ContextoEmpresa."""
import pytest
from fastapi import HTTPException

from app.api.v1.empresa_contexto import ContextoEmpresa


def test_verificar_acceso_permite_empresa_propia():
    ctx = ContextoEmpresa(
        empresa_usuario_id=5,
        es_empresa_maestra=False,
        empresa_id_filtro=None,
        empresas_administradas_ids=[5],
    )
    ctx.verificar_acceso_a_empresa(5)


def test_verificar_acceso_permite_empresa_maestra():
    ctx = ContextoEmpresa(
        empresa_usuario_id=1,
        es_empresa_maestra=True,
        empresa_id_filtro=None,
        empresas_administradas_ids=[1, 2, 3],
    )
    ctx.verificar_acceso_a_empresa(99)


def test_verificar_acceso_rechaza_otra_empresa():
    ctx = ContextoEmpresa(
        empresa_usuario_id=5,
        es_empresa_maestra=False,
        empresa_id_filtro=None,
        empresas_administradas_ids=[5],
    )
    with pytest.raises(HTTPException) as exc:
        ctx.verificar_acceso_a_empresa(9)
    assert exc.value.status_code == 403
