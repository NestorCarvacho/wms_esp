"""Mapeo ORM → entidades de dominio IAM."""
from __future__ import annotations

from typing import Any

from app.shared.formatting import format_empresa_nombre
from app.modules.iam.domain.entities import PerfilUsuario, Usuario, UsuarioAuth


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
        region_nombre=row.region.nombre if getattr(row, "region", None) else None,
        ciudad_nombre=row.ciudad.nombre if getattr(row, "ciudad", None) else None,
        comuna_nombre=row.comuna.nombre if getattr(row, "comuna", None) else None,
        pais=row.pais,
        locale_override=getattr(row, "locale_override", None),
        timezone_override=getattr(row, "timezone_override", None),
        foto_url=row.foto_url,
        biografia=row.biografia,
    )


def usuario_desde_orm(row: Any) -> Usuario:
    perfil = perfil_desde_orm(row.perfil) if getattr(row, "perfil", None) else None
    return Usuario(
        id=row.id,
        empresa_id=row.empresa_id,
        email=row.email,
        activo=row.activo,
        cargo_id=row.cargo_id,
        ultimo_login=row.ultimo_login,
        fecha_creacion=row.fecha_creacion,
        fecha_actualizacion=row.fecha_actualizacion,
        empresa_nombre=format_empresa_nombre(row.empresa) if getattr(row, "empresa", None) else None,
        cargo_nombre=row.cargo.nombre if getattr(row, "cargo", None) else None,
        perfil=perfil,
    )


def usuario_auth_desde_orm(row: Any) -> UsuarioAuth:
    empresa = getattr(row, "empresa", None)
    perfil_orm = getattr(row, "perfil", None)
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
        cargo_nombre=row.cargo.nombre if getattr(row, "cargo", None) else None,
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
