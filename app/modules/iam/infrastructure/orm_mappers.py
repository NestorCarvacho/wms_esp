"""Mapeo ORM → entidades de dominio IAM."""
from __future__ import annotations

from typing import Any

from sqlalchemy.orm import attributes

from app.shared.formatting import format_empresa_nombre
from app.modules.iam.domain.entities import PerfilUsuario, Usuario, UsuarioAuth


def _relacion_cargada(parent: Any, nombre: str) -> Any | None:
    if parent is None:
        return None
    if nombre in attributes.instance_state(parent).unloaded:
        return None
    return getattr(parent, nombre, None)


def _nombre_relacion(parent: Any, nombre: str) -> str | None:
    rel = _relacion_cargada(parent, nombre)
    return rel.nombre if rel is not None else None


def perfil_desde_orm(row: Any) -> PerfilUsuario:
    return PerfilUsuario(
        usuario_id=row.usuario_id,
        rut=row.rut,
        nombres=row.nombres,
        apellido_paterno=row.apellido_paterno,
        apellido_materno=row.apellido_materno,
        fecha_nacimiento=row.fecha_nacimiento,
        genero=row.genero,
        telefono=row.telefono,
        direccion=row.direccion,
        region_id=row.region_id,
        ciudad_id=row.ciudad_id,
        comuna_id=row.comuna_id,
        region_nombre=_nombre_relacion(row, "region"),
        ciudad_nombre=_nombre_relacion(row, "ciudad"),
        comuna_nombre=_nombre_relacion(row, "comuna"),
        pais=row.pais,
        locale_override=getattr(row, "locale_override", None),
        timezone_override=getattr(row, "timezone_override", None),
        foto_url=row.foto_url,
        biografia=row.biografia,
    )


def usuario_desde_orm(row: Any) -> Usuario:
    perfil_orm = _relacion_cargada(row, "perfil")
    perfil = perfil_desde_orm(perfil_orm) if perfil_orm else None
    empresa = _relacion_cargada(row, "empresa")
    cargo = _relacion_cargada(row, "cargo")
    return Usuario(
        id=row.id,
        empresa_id=row.empresa_id,
        email=row.email,
        activo=row.activo,
        cargo_id=row.cargo_id,
        ultimo_login=row.ultimo_login,
        fecha_creacion=row.fecha_creacion,
        fecha_actualizacion=row.fecha_actualizacion,
        empresa_nombre=format_empresa_nombre(empresa) if empresa else None,
        cargo_nombre=cargo.nombre if cargo else None,
        perfil=perfil,
    )


def usuario_auth_desde_orm(row: Any) -> UsuarioAuth:
    empresa = _relacion_cargada(row, "empresa")
    perfil_orm = _relacion_cargada(row, "perfil")
    cargo = _relacion_cargada(row, "cargo")
    return UsuarioAuth(
        id=row.id,
        empresa_id=row.empresa_id,
        email=row.email,
        password_hash=row.password_hash,
        cargo_id=row.cargo_id,
        activo=row.activo,
        intentos_fallidos=row.intentos_fallidos or 0,
        bloqueado_hasta=row.bloqueado_hasta,
        bloqueos_temporales=row.bloqueos_temporales or 0,
        bloqueado_permanente=bool(row.bloqueado_permanente),
        ultimo_login=row.ultimo_login,
        fecha_creacion=row.fecha_creacion,
        fecha_actualizacion=row.fecha_actualizacion,
        es_empresa_maestra=bool(getattr(empresa, "es_empresa_maestra", False)) if empresa else False,
        empresa_esta_activa=bool(getattr(empresa, "esta_activa", True)) if empresa else True,
        empresa_activo=bool(getattr(empresa, "activo", True)) if empresa else True,
        empresa_nombre=format_empresa_nombre(empresa) if empresa else None,
        cargo_nombre=cargo.nombre if cargo else None,
        empresa_locale=getattr(empresa, "locale", None) or "es-CL",
        empresa_timezone=getattr(empresa, "timezone", None) or "America/Santiago",
        empresa_moneda=getattr(empresa, "moneda_codigo", None) or "CLP",
        perfil_locale_override=getattr(perfil_orm, "locale_override", None) if perfil_orm else None,
        perfil_timezone_override=getattr(perfil_orm, "timezone_override", None) if perfil_orm else None,
        perfil=perfil_desde_orm(perfil_orm) if perfil_orm else None,
    )


def aplicar_auth_a_orm(auth: UsuarioAuth, row: Any) -> None:
    row.password_hash = auth.password_hash
    row.activo = auth.activo
    row.intentos_fallidos = auth.intentos_fallidos
    row.bloqueado_hasta = auth.bloqueado_hasta
    row.bloqueos_temporales = auth.bloqueos_temporales
    row.bloqueado_permanente = auth.bloqueado_permanente
    row.ultimo_login = auth.ultimo_login
