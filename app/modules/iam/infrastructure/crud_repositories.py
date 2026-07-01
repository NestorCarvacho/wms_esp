"""Adaptadores CRUD y RBAC sobre repositorios legacy."""
from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.repositories.empresa_crud_repository import EmpresaCRUDRepository
from app.infrastructure.repositories.empresa_rbac_bootstrap_repository import (
    EmpresaRbacBootstrapRepository,
)
from app.infrastructure.repositories.cargo_crud_repository import CargoCRUDRepository
from app.infrastructure.repositories.permiso_crud_repository import PermisoCRUDRepository
from app.infrastructure.repositories.permiso_cargo_crud_repository import PermisoCargoCRUDRepository
from app.infrastructure.repositories.rol_crud_repository import RolCRUDRepository
from app.infrastructure.repositories.rol_permiso_crud_repository import RolPermisoCRUDRepository
from app.infrastructure.repositories.usuario_crud_repository import UsuarioCRUDRepository
from app.infrastructure.repositories.usuario_rol_crud_repository import UsuarioRolCRUDRepository
from app.modules.tenant.infrastructure.tenant_access_adapter import TenantAccessAdapter


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
        self._adapter = TenantAccessAdapter(session)

    async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> None:
        await self._adapter.validar_acceso(empresa_maestra_id, empresa_objetivo_id)


class SqlAlchemyRolRepository:
    def __init__(self, session: AsyncSession):
        self._repo = RolCRUDRepository(session)

    async def listar(self, empresa_id: int, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(empresa_id=empresa_id, **kwargs)

    async def obtener_por_id(self, rol_id: int, empresa_id: int | None) -> Any | None:
        return await self._repo.obtener_por_id(rol_id, empresa_id)

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_nombre(nombre, empresa_id)

    async def crear(
        self, empresa_id: int, nombre: str, descripcion: str | None, activo: bool = True
    ) -> Any:
        return await self._repo.crear(empresa_id, nombre, descripcion, activo)

    async def actualizar(
        self,
        rol_id: int,
        empresa_id: int,
        nombre: str | None = None,
        descripcion: str | None = None,
        activo: bool | None = None,
    ) -> Any | None:
        return await self._repo.actualizar(rol_id, empresa_id, nombre, descripcion, activo)

    async def eliminar(self, rol_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(rol_id, empresa_id)


class SqlAlchemyPermisoRepository:
    def __init__(self, session: AsyncSession):
        self._repo = PermisoCRUDRepository(session)

    async def listar(self, empresa_id: int, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(empresa_id, **kwargs)

    async def obtener_por_codigo(self, codigo: str, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_codigo(codigo, empresa_id)

    async def crear(
        self, empresa_id: int, codigo: str, descripcion: str | None, activo: bool = True
    ) -> Any:
        return await self._repo.crear(empresa_id, codigo, descripcion, activo)

    async def actualizar(self, permiso_id: int, empresa_id: int, **campos: Any) -> Any | None:
        return await self._repo.actualizar(permiso_id, empresa_id, **campos)

    async def eliminar(self, permiso_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(permiso_id, empresa_id)


class SqlAlchemyCargoRepository:
    def __init__(self, session: AsyncSession):
        self._repo = CargoCRUDRepository(session)

    async def listar(self, empresa_id: int, **kwargs: Any) -> tuple[list[Any], int]:
        return await self._repo.listar(empresa_id=empresa_id, **kwargs)

    async def obtener_por_id(self, cargo_id: int, empresa_id: int | None) -> Any | None:
        return await self._repo.obtener_por_id(cargo_id, empresa_id)

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_nombre(nombre, empresa_id)

    async def crear(self, empresa_id: int, nombre: str) -> Any:
        return await self._repo.crear(empresa_id, nombre)

    async def actualizar(
        self, cargo_id: int, empresa_id: int, nombre: str | None
    ) -> Any | None:
        return await self._repo.actualizar(cargo_id, empresa_id, nombre)

    async def eliminar(self, cargo_id: int, empresa_id: int) -> bool:
        return await self._repo.eliminar(cargo_id, empresa_id)


class SqlAlchemyEmpresaReadRepository:
    def __init__(self, session: AsyncSession):
        self._repo = EmpresaCRUDRepository(session)

    async def obtener_por_id(self, empresa_id: int) -> Any | None:
        return await self._repo.obtener_por_id(empresa_id)


class SqlAlchemyRbacBootstrapRepository:
    def __init__(self, session: AsyncSession):
        self._repo = EmpresaRbacBootstrapRepository(session)
        self._session = session

    async def contar_permisos(self, empresa_id: int) -> int:
        return await self._repo.contar_permisos(empresa_id)

    async def listar_roles_activos(self, empresa_id: int) -> list[Any]:
        return await self._repo.listar_roles_activos(empresa_id)

    async def codigos_permiso_de_rol(self, rol_id: int) -> list[str]:
        return await self._repo.codigos_permiso_de_rol(rol_id)

    async def copiar_permisos(self, empresa_plantilla_id: int, empresa_destino_id: int) -> int:
        return await self._repo.copiar_permisos(empresa_plantilla_id, empresa_destino_id)

    async def asegurar_rol(self, empresa_id: int, nombre: str, descripcion: str | None) -> Any:
        return await self._repo.asegurar_rol(empresa_id, nombre, descripcion)

    async def ids_por_codigos(self, empresa_id: int, codigos: list[str]) -> list[int]:
        return await self._repo.ids_por_codigos(empresa_id, codigos)

    async def reemplazar_rol_permiso(self, rol_id: int, permiso_ids: list[int]) -> None:
        await self._repo.reemplazar_rol_permiso(rol_id, permiso_ids)

    async def listar_cargos_activos(self, empresa_id: int) -> list[Any]:
        return await self._repo.listar_cargos_activos(empresa_id)

    async def asegurar_cargo(self, empresa_id: int, nombre: str) -> Any:
        return await self._repo.asegurar_cargo(empresa_id, nombre)

    async def nombres_roles_de_cargo(self, cargo_id: int) -> list[str]:
        return await self._repo.nombres_roles_de_cargo(cargo_id)

    async def obtener_rol_por_nombre(self, empresa_id: int, nombre: str) -> Any | None:
        return await self._repo.obtener_rol_por_nombre(empresa_id, nombre)

    async def asegurar_permiso_cargo(self, cargo_id: int, rol_id: int) -> None:
        await self._repo.asegurar_permiso_cargo(cargo_id, rol_id)

    async def vincular_empresa_administrada(
        self, empresa_maestra_id: int, empresa_hija_id: int
    ) -> None:
        await self._repo.vincular_empresa_administrada(empresa_maestra_id, empresa_hija_id)

    async def usuarios_sin_roles_con_cargo(self, empresa_id: int) -> list[tuple[int, int]]:
        return await self._repo.usuarios_sin_roles_con_cargo(empresa_id)

    async def roles_de_cargo(self, cargo_id: int, empresa_id: int) -> list[int]:
        return await self._repo.roles_de_cargo(cargo_id, empresa_id)

    async def asignar_roles_usuario(self, usuario_id: int, rol_ids: list[int]) -> None:
        await self._repo.asignar_roles_usuario(usuario_id, rol_ids)

    async def contar_usuarios(self, empresa_id: int) -> int:
        return await self._repo.contar_usuarios(empresa_id)

    async def crear_usuario_admin_inicial(
        self, *, empresa_id: int, email: str, password_hash: str, cargo_id: int | None
    ) -> Any:
        return await self._repo.crear_usuario_admin_inicial(
            empresa_id, email, password_hash, cargo_id
        )

    async def flush(self) -> None:
        await self._session.flush()

    async def commit(self) -> None:
        await self._repo.commit()

    async def rollback(self) -> None:
        await self._repo.rollback()
