"""Construcción de respuesta de sesión (login)."""
from __future__ import annotations

from typing import Any

from app.modules.iam.application.perfil_mappers import serializar_perfil
from app.modules.iam.application.usuario_mappers import serializar_usuario_detalle
from app.modules.iam.domain.entities import Usuario, UsuarioAuth
from app.modules.iam.domain.services.locale_preferences import resolver_preferencias_locale


def construir_respuesta_sesion(
    usuario: UsuarioAuth,
    permisos: list[str],
    roles: list[str],
    access_token: str,
) -> dict[str, Any]:
    usuario_vista = Usuario(
        id=usuario.id,
        empresa_id=usuario.empresa_id,
        email=usuario.email,
        activo=usuario.activo,
        cargo_id=usuario.cargo_id,
        ultimo_login=usuario.ultimo_login,
        fecha_creacion=usuario.fecha_creacion,
        fecha_actualizacion=usuario.fecha_actualizacion,
        empresa_nombre=usuario.empresa_nombre,
        cargo_nombre=usuario.cargo_nombre,
        perfil=usuario.perfil,
    )
    usuario_data = serializar_usuario_detalle(usuario_vista)
    usuario_data["es_empresa_maestra"] = usuario.es_empresa_maestra
    usuario_data["roles"] = roles
    usuario_data["permisos"] = permisos
    usuario_data["preferencias_locale"] = resolver_preferencias_locale(usuario)
    if usuario.perfil:
        usuario_data["perfil"] = serializar_perfil(usuario.perfil)
    return {
        "acceso_token": access_token,
        "token_type": "bearer",
        "usuario": usuario_data,
    }
