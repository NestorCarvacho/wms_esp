"""Adaptadores CRUD y RBAC sobre repositorios legacy."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.services.empresa_maestra_service import EmpresaMaestraService
from app.infrastructure.repositories.empresa_administrada_repository import (
    EmpresaAdministradaRepository,
)
from app.infrastructure.repositories.permiso_cargo_crud_repository import PermisoCargoCRUDRepository
from app.infrastructure.repositories.rol_permiso_crud_repository import RolPermisoCRUDRepository
from app.infrastructure.repositories.usuario_crud_repository import UsuarioCRUDRepository
from app.infrastructure.repositories.usuario_rol_crud_repository import UsuarioRolCRUDRepository


class SqlAlchemyUsuarioCrudRepository:
    def __init__(self, session: AsyncSession):
        self._repo = UsuarioCRUDRepository(session)

    async def listar(self, empresa_id: int, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(empresa_id=empresa_id, **kwargs)

    async def obtener_por_id(self, usuario_id: int, empresa_id: int | None) -> Any | None:
        return await self._repo.obtener_por_id(usuario_id, empresa_id)

    async def obtener_por_email(self, email: str, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_email(email, empresa_id)

    async def crear(
        self, *, empresa_id: int, email: str, contrasena: str, cargo_id: int | None = None
    ) -> Any:
        return await self._repo.crear(
            empresa_id=empresa_id, email=email, contrasena=contrasena, cargo_id=cargo_id
        )

    async def actualizar(self, usuario_id: int, empresa_id: int, **campos: Any) -> Any | None:
        return await self._repo.actualizar(usuario_id=usuario_id, empresa_id=empresa_id, **campos)

    async def eliminar(self, usuario_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(usuario_id, empresa_id)

    async def reactivar(self, usuario_id: int, empresa_id: int) -> Any | None:
        return await self._repo.reactivar(usuario_id, empresa_id)


class SqlAlchemyUsuarioRolRepository:
    def __init__(self, session: AsyncSession):
        self._repo = UsuarioRolCRUDRepository(session)

    async def obtener_usuario(self, usuario_id: int, empresa_id: int | None) -> Any | None:
        return await self._repo.obtener_usuario(usuario_id, empresa_id)

    async def listar_roles_por_usuario(self, usuario_id: int, empresa_id: int) -> list[int]:
        return await self._repo.listar_roles_por_usuario(usuario_id, empresa_id)

    async def sincronizar_roles_usuario(
        self, usuario_id: int, empresa_id: int, rol_ids: list[int]
    ) -> list[int]:
        return await self._repo.sincronizar_roles_usuario(usuario_id, empresa_id, rol_ids)

    async def heredar_roles_desde_cargo(
        self, usuario_id: int, cargo_id: int, empresa_id: int
    ) -> list[int]:
        return await self._repo.heredar_roles_desde_cargo(usuario_id, cargo_id, empresa_id)


class SqlAlchemyRolPermisoRepository:
    def __init__(self, session: AsyncSession):
        self._repo = RolPermisoCRUDRepository(session)

    async def obtener_rol(self, rol_id: int) -> Any | None:
        return await self._repo.obtener_rol(rol_id)

    async def listar_por_rol(self, rol_id: int, empresa_id: int) -> list[tuple[Any, Any]]:
        return await self._repo.listar_por_rol(rol_id, empresa_id)

    async def sincronizar(
        self, rol_id: int, empresa_id: int, permiso_ids: list[int]
    ) -> list[int]:
        return await self._repo.sincronizar(rol_id, empresa_id, permiso_ids)


class SqlAlchemyPermisoCargoRepository:
    def __init__(self, session: AsyncSession):
        self._repo = PermisoCargoCRUDRepository(session)

    async def obtener_cargo(self, cargo_id: int, empresa_id: int | None) -> Any | None:
        return await self._repo.obtener_cargo(cargo_id, empresa_id)

    async def listar_roles_por_cargo(self, cargo_id: int, empresa_id: int) -> list[int]:
        return await self._repo.listar_roles_por_cargo(cargo_id, empresa_id)

    async def sincronizar_roles_cargo(
        self, cargo_id: int, empresa_id: int, rol_ids: list[int]
    ) -> list[int]:
        return await self._repo.sincronizar_roles_cargo(cargo_id, empresa_id, rol_ids)


class SqlAlchemyTenantAccessValidator:
    def __init__(self, session: AsyncSession):
        self._service = EmpresaMaestraService(EmpresaAdministradaRepository(session))

    async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> None:
        await self._service.validar_acceso(empresa_maestra_id, empresa_objetivo_id)
