"""Mapeo de entidades usuario a respuestas API."""
from __future__ import annotations

from app.modules.iam.application.perfil_mappers import serializar_perfil
from app.modules.iam.domain.entities import Usuario


def serializar_usuario_lista(u: Usuario) -> dict:
    data = {
        "id": u.id,
        "empresa_id": u.empresa_id,
        "cargo_id": u.cargo_id,
        "email": u.email,
        "activo": u.activo,
        "ultimo_login": u.ultimo_login,
        "fecha_creacion": u.fecha_creacion,
        "empresa_nombre": u.empresa_nombre,
        "cargo_nombre": u.cargo_nombre,
        "perfil": serializar_perfil(u.perfil) if u.perfil else None,
    }
    return data


def serializar_usuario_detalle(usuario: Usuario) -> dict:
    data = serializar_usuario_lista(usuario)
    data["fecha_actualizacion"] = usuario.fecha_actualizacion
    return data


def serializar_usuario_creado(usuario: Usuario) -> dict:
    return {
        "id": usuario.id,
        "empresa_id": usuario.empresa_id,
        "email": usuario.email,
        "cargo_id": usuario.cargo_id,
        "activo": usuario.activo,
        "fecha_creacion": usuario.fecha_creacion,
    }
