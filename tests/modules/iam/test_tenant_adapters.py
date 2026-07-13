"""Tests de adaptadores IAM → tenant."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.modules.iam.infrastructure.tenant_adapters import (
    TenantAccessPortAdapter,
    TenantEmpresaLookupAdapter,
)


@pytest.mark.asyncio
async def test_empresa_lookup_delega_obtener_por_id(monkeypatch):
    session = MagicMock()
    empresa = MagicMock(id=5)
    repo_cls = MagicMock()
    repo_instance = MagicMock()
    repo_instance.obtener_por_id = AsyncMock(return_value=empresa)
    repo_cls.return_value = repo_instance
    monkeypatch.setattr(
        "app.modules.iam.infrastructure.tenant_adapters.EmpresaCRUDRepository",
        repo_cls,
    )

    adapter = TenantEmpresaLookupAdapter(session)
    result = await adapter.obtener_por_id(5)

    assert result is empresa
    repo_instance.obtener_por_id.assert_awaited_once_with(5)


@pytest.mark.asyncio
async def test_tenant_access_delega_validar_acceso(monkeypatch):
    session = MagicMock()
    adapter_cls = MagicMock()
    adapter_instance = MagicMock()
    adapter_instance.validar_acceso = AsyncMock()
    adapter_cls.return_value = adapter_instance
    monkeypatch.setattr(
        "app.modules.iam.infrastructure.tenant_adapters.TenantAccessAdapter",
        adapter_cls,
    )

    port = TenantAccessPortAdapter(session)
    await port.validar_acceso(empresa_maestra_id=1, empresa_objetivo_id=2)

    adapter_instance.validar_acceso.assert_awaited_once_with(1, 2)
