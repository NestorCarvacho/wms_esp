"""Mappers perfil usuario."""
from __future__ import annotations

from typing import Any

from app.modules.iam.domain.entities import PerfilUsuario


def serializar_perfil(perfil: PerfilUsuario) -> dict[str, Any]:
    return {
        "usuario_id": perfil.usuario_id,
        "rut": perfil.rut,
        "nombres": perfil.nombres,
        "apellido_paterno": perfil.apellido_paterno,
        "apellido_materno": perfil.apellido_materno,
        "fecha_nacimiento": perfil.fecha_nacimiento,
        "genero": perfil.genero,
        "telefono": perfil.telefono,
        "direccion": perfil.direccion,
        "region_id": perfil.region_id,
        "ciudad_id": perfil.ciudad_id,
        "comuna_id": perfil.comuna_id,
        "region_nombre": perfil.region_nombre,
        "ciudad_nombre": perfil.ciudad_nombre,
        "comuna_nombre": perfil.comuna_nombre,
        "pais": perfil.pais,
        "foto_url": perfil.foto_url,
        "biografia": perfil.biografia,
    }
