"""Entidades de dominio del bounded context IAM."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime


@dataclass(frozen=True)
class PerfilUsuario:
    usuario_id: int
    rut: str | None = None
    nombres: str | None = None
    apellido_paterno: str | None = None
    apellido_materno: str | None = None
    fecha_nacimiento: date | None = None
    genero: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    region_id: int | None = None
    ciudad_id: int | None = None
    comuna_id: int | None = None
    region_nombre: str | None = None
    ciudad_nombre: str | None = None
    comuna_nombre: str | None = None
    pais: str | None = None
    locale_override: str | None = None
    timezone_override: str | None = None
    foto_url: str | None = None
    biografia: str | None = None


@dataclass(frozen=True)
class Usuario:
    id: int
    empresa_id: int
    email: str
    activo: bool
    cargo_id: int | None = None
    ultimo_login: datetime | None = None
    fecha_creacion: datetime | None = None
    fecha_actualizacion: datetime | None = None
    empresa_nombre: str | None = None
    cargo_nombre: str | None = None
    perfil: PerfilUsuario | None = None


@dataclass
class UsuarioAuth:
    """Agregado mutable para autenticación (lockout + credenciales)."""

    id: int
    empresa_id: int
    email: str
    password_hash: str
    cargo_id: int | None = None
    activo: bool = True
    intentos_fallidos: int = 0
    bloqueado_hasta: datetime | None = None
    bloqueos_temporales: int = 0
    bloqueado_permanente: bool = False
    ultimo_login: datetime | None = None
    fecha_creacion: datetime | None = None
    fecha_actualizacion: datetime | None = None
    es_empresa_maestra: bool = False
    empresa_esta_activa: bool = True
    empresa_activo: bool = True
    empresa_nombre: str | None = None
    cargo_nombre: str | None = None
    empresa_locale: str = "es-CL"
    empresa_timezone: str = "America/Santiago"
    empresa_moneda: str = "CLP"
    perfil_locale_override: str | None = None
    perfil_timezone_override: str | None = None
    perfil: PerfilUsuario | None = field(default=None)
