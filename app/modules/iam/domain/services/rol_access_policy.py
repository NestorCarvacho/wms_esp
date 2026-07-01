"""Políticas de acceso multi-tenant para RBAC."""
from __future__ import annotations

from typing import Any

from app.modules.iam.domain.ports import ITenantAccessValidator


async def resolver_empresa_efectiva_rol(
    rol: Any,
    usuario: dict[str, Any],
    tenant: ITenantAccessValidator,
) -> int:
    empresa_caller = usuario.get("empresa_id")
    es_maestra = bool(usuario.get("es_empresa_maestra"))

    if not es_maestra:
        if rol.empresa_id != empresa_caller:
            raise ValueError("No autorizado para gestionar permisos de este rol")
        return rol.empresa_id

    await tenant.validar_acceso(empresa_caller, rol.empresa_id)
    return rol.empresa_id
