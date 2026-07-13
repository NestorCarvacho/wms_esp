"""Opciones de carga ORM reutilizables (evita lazy load en async)."""
from sqlalchemy.orm import selectinload

from app.infrastructure.models.usuario import PerfilUsuario, Usuario

USUARIO_CON_PERFIL_GEO_LOAD = (
    selectinload(Usuario.perfil).selectinload(PerfilUsuario.region),
    selectinload(Usuario.perfil).selectinload(PerfilUsuario.ciudad),
    selectinload(Usuario.perfil).selectinload(PerfilUsuario.comuna),
    selectinload(Usuario.empresa),
    selectinload(Usuario.cargo),
)
