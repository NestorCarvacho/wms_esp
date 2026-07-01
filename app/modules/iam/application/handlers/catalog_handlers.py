"""Handlers CRUD catálogo: roles, permisos, cargos."""
from __future__ import annotations

from typing import Any

from app.modules.iam.application.catalog_mappers import (
    serializar_cargo_lista,
    serializar_permiso_lista,
    serializar_rol_detalle,
    serializar_rol_lista,
)
from app.modules.iam.application.commands_catalog import (
    ActualizarCargoCommand,
    ActualizarPermisoCommand,
    ActualizarRolCommand,
    CrearCargoCommand,
    CrearPermisoCommand,
    CrearRolCommand,
)
from app.modules.iam.domain.ports import ICargoRepository, IPermisoRepository, IRolRepository


class ListarRolesQueryHandler:
    def __init__(self, repo: IRolRepository):
        self.repo = repo

    async def handle(self, empresa_id: int, **kwargs: Any) -> dict:
        roles, total = await self.repo.listar(empresa_id=empresa_id, **kwargs)
        return {
            "total": total,
            "pagina": kwargs.get("pagina", 1),
            "por_pagina": kwargs.get("por_pagina", 10),
            "roles": [serializar_rol_lista(r) for r in roles],
        }


class ObtenerRolQueryHandler:
    def __init__(self, repo: IRolRepository):
        self.repo = repo

    async def handle(self, rol_id: int, empresa_id: int | None = None) -> dict:
        rol = await self.repo.obtener_por_id(rol_id, empresa_id)
        if not rol:
            raise ValueError("Rol no encontrado")
        return serializar_rol_detalle(rol)


class CrearRolHandler:
    def __init__(self, repo: IRolRepository):
        self.repo = repo

    async def handle(self, cmd: CrearRolCommand) -> dict:
        if not cmd.nombre or not cmd.nombre.strip():
            raise ValueError("El nombre del rol no puede estar vacío")
        if not cmd.descripcion or not str(cmd.descripcion).strip():
            raise ValueError("La descripción del rol no puede estar vacía")
        nombre = cmd.nombre.strip()
        descripcion = str(cmd.descripcion).strip()
        if await self.repo.obtener_por_nombre(nombre, cmd.empresa_id):
            raise ValueError(f"Ya existe un rol con el nombre '{nombre}' en esta empresa")
        nuevo = await self.repo.crear(cmd.empresa_id, nombre, descripcion, cmd.activo)
        return serializar_rol_detalle(nuevo)


class ActualizarRolHandler:
    def __init__(self, repo: IRolRepository):
        self.repo = repo

    async def handle(self, cmd: ActualizarRolCommand) -> dict:
        if not await self.repo.obtener_por_id(cmd.rol_id, cmd.empresa_id):
            raise ValueError("Rol no encontrado")
        if cmd.nombre is not None and cmd.nombre.strip():
            nombre = cmd.nombre.strip()
            existente = await self.repo.obtener_por_nombre(nombre, cmd.empresa_id)
            if existente and existente.id != cmd.rol_id:
                raise ValueError(f"Ya existe un rol con el nombre '{nombre}' en esta empresa")
        actualizado = await self.repo.actualizar(
            cmd.rol_id, cmd.empresa_id, cmd.nombre, cmd.descripcion, cmd.activo
        )
        if not actualizado:
            raise ValueError("Error al actualizar el rol")
        return serializar_rol_detalle(actualizado)


class EliminarRolHandler:
    def __init__(self, repo: IRolRepository):
        self.repo = repo

    async def handle(self, rol_id: int, empresa_id: int) -> dict:
        rol = await self.repo.obtener_por_id(rol_id, empresa_id)
        if not rol:
            raise ValueError("Rol no encontrado")
        if not await self.repo.eliminar(rol_id, empresa_id):
            raise ValueError("Error al eliminar el rol")
        return {"mensaje": f"Rol '{rol.nombre}' eliminado exitosamente", "rol_id": rol_id}


class ListarPermisosQueryHandler:
    def __init__(self, repo: IPermisoRepository):
        self.repo = repo

    async def handle(self, empresa_id: int, **kwargs: Any) -> dict:
        permisos, total = await self.repo.listar(empresa_id, **kwargs)
        return {
            "total": total,
            "pagina": kwargs.get("pagina", 1),
            "por_pagina": kwargs.get("por_pagina", 10),
            "permisos": [serializar_permiso_lista(p) for p in permisos],
        }


class CrearPermisoHandler:
    def __init__(self, repo: IPermisoRepository):
        self.repo = repo

    async def handle(self, cmd: CrearPermisoCommand) -> dict:
        codigo = cmd.codigo.strip()
        if not codigo:
            raise ValueError("El código del permiso no puede estar vacío")
        if await self.repo.obtener_por_codigo(codigo, cmd.empresa_id):
            raise ValueError(f"Ya existe el permiso '{codigo}' en esta empresa")
        permiso = await self.repo.crear(cmd.empresa_id, codigo, cmd.descripcion, cmd.activo)
        return {"id": permiso.id, "codigo": permiso.codigo, "descripcion": permiso.descripcion}


class ActualizarPermisoHandler:
    def __init__(self, repo: IPermisoRepository):
        self.repo = repo

    async def handle(self, cmd: ActualizarPermisoCommand) -> dict:
        campos = cmd.campos
        if "codigo" in campos and campos["codigo"]:
            existente = await self.repo.obtener_por_codigo(
                campos["codigo"].strip(), cmd.empresa_id
            )
            if existente and existente.id != cmd.permiso_id:
                raise ValueError(f"Ya existe el permiso '{campos['codigo']}' en esta empresa")
        actualizado = await self.repo.actualizar(cmd.permiso_id, cmd.empresa_id, **campos)
        if not actualizado:
            raise ValueError("Permiso no encontrado")
        return {
            "id": actualizado.id,
            "codigo": actualizado.codigo,
            "descripcion": actualizado.descripcion,
            "activo": actualizado.activo,
        }


class EliminarPermisoHandler:
    def __init__(self, repo: IPermisoRepository):
        self.repo = repo

    async def handle(self, permiso_id: int, empresa_id: int) -> dict:
        if not await self.repo.eliminar(permiso_id, empresa_id):
            raise ValueError("Permiso no encontrado")
        return {"mensaje": "Permiso eliminado exitosamente"}


class ListarCargosQueryHandler:
    def __init__(self, repo: ICargoRepository):
        self.repo = repo

    async def handle(self, empresa_id: int, **kwargs: Any) -> dict:
        cargos, total = await self.repo.listar(empresa_id=empresa_id, **kwargs)
        return {
            "total": total,
            "pagina": kwargs.get("pagina", 1),
            "por_pagina": kwargs.get("por_pagina", 10),
            "cargos": [serializar_cargo_lista(c) for c in cargos],
        }


class ObtenerCargoQueryHandler:
    def __init__(self, repo: ICargoRepository):
        self.repo = repo

    async def handle(self, cargo_id: int, empresa_id: int | None = None) -> dict:
        cargo = await self.repo.obtener_por_id(cargo_id, empresa_id)
        if not cargo:
            raise ValueError("Cargo no encontrado")
        return {"id": cargo.id, "empresa_id": cargo.empresa_id, "nombre": cargo.nombre}


class CrearCargoHandler:
    def __init__(self, repo: ICargoRepository):
        self.repo = repo

    async def handle(self, cmd: CrearCargoCommand) -> dict:
        if not cmd.nombre or not cmd.nombre.strip():
            raise ValueError("El nombre del cargo no puede estar vacío")
        nombre = cmd.nombre.strip()
        if await self.repo.obtener_por_nombre(nombre, cmd.empresa_id):
            raise ValueError(f"Ya existe un cargo con el nombre '{nombre}' en esta empresa")
        nuevo = await self.repo.crear(cmd.empresa_id, nombre)
        return {"id": nuevo.id, "empresa_id": nuevo.empresa_id, "nombre": nuevo.nombre}


class ActualizarCargoHandler:
    def __init__(self, repo: ICargoRepository):
        self.repo = repo

    async def handle(self, cmd: ActualizarCargoCommand) -> dict:
        if not await self.repo.obtener_por_id(cmd.cargo_id, cmd.empresa_id):
            raise ValueError("Cargo no encontrado")
        if cmd.nombre is not None and cmd.nombre.strip():
            nombre = cmd.nombre.strip()
            existente = await self.repo.obtener_por_nombre(nombre, cmd.empresa_id)
            if existente and existente.id != cmd.cargo_id:
                raise ValueError(f"Ya existe un cargo con el nombre '{nombre}' en esta empresa")
        actualizado = await self.repo.actualizar(cmd.cargo_id, cmd.empresa_id, cmd.nombre)
        if not actualizado:
            raise ValueError("Error al actualizar el cargo")
        return {
            "id": actualizado.id,
            "empresa_id": actualizado.empresa_id,
            "nombre": actualizado.nombre,
        }


class EliminarCargoHandler:
    def __init__(self, repo: ICargoRepository):
        self.repo = repo

    async def handle(self, cargo_id: int, empresa_id: int) -> dict:
        cargo = await self.repo.obtener_por_id(cargo_id, empresa_id)
        if not cargo:
            raise ValueError("Cargo no encontrado")
        if not await self.repo.eliminar(cargo_id, empresa_id):
            raise ValueError("Error al eliminar el cargo")
        return {
            "mensaje": f"Cargo '{cargo.nombre}' eliminado exitosamente",
            "cargo_id": cargo_id,
        }
