"""Copia catálogo RBAC (permisos, roles, rol_permiso) desde empresa plantilla."""
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.empresa_administrada import EmpresaAdministrada
from app.infrastructure.models.usuario import Cargo, Permiso, PermisoCargo, Rol, RolPermiso, Usuario, UsuarioRol


class EmpresaRbacBootstrapRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def contar_permisos(self, empresa_id: int) -> int:
        stmt = select(func.count(Permiso.id)).where(
            Permiso.empresa_id == empresa_id,
            Permiso.activo == True,
        )
        return (await self.session.execute(stmt)).scalar() or 0

    async def listar_roles_activos(self, empresa_id: int) -> list[Rol]:
        result = await self.session.execute(
            select(Rol).where(Rol.empresa_id == empresa_id, Rol.activo == True)
        )
        return list(result.scalars().all())

    async def codigos_permiso_de_rol(self, rol_id: int) -> list[str]:
        stmt = (
            select(Permiso.codigo)
            .join(RolPermiso, RolPermiso.permiso_id == Permiso.id)
            .where(
                RolPermiso.rol_id == rol_id,
                RolPermiso.activo == True,
                Permiso.activo == True,
            )
            .order_by(Permiso.codigo)
        )
        result = await self.session.execute(stmt)
        return [row[0] for row in result.all()]

    async def copiar_permisos(self, empresa_plantilla_id: int, empresa_destino_id: int) -> int:
        plantilla = await self.session.execute(
            select(Permiso).where(
                Permiso.empresa_id == empresa_plantilla_id,
                Permiso.activo == True,
            )
        )
        creados = 0
        for permiso in plantilla.scalars().all():
            existente = await self.session.execute(
                select(Permiso).where(
                    Permiso.empresa_id == empresa_destino_id,
                    Permiso.codigo == permiso.codigo,
                )
            )
            row = existente.scalars().first()
            if row:
                if not row.activo or row.descripcion != permiso.descripcion:
                    row.activo = True
                    row.descripcion = permiso.descripcion
                continue
            self.session.add(
                Permiso(
                    empresa_id=empresa_destino_id,
                    codigo=permiso.codigo,
                    descripcion=permiso.descripcion,
                    activo=True,
                )
            )
            creados += 1
        return creados

    async def asegurar_rol(self, empresa_id: int, nombre: str, descripcion: str | None) -> Rol:
        result = await self.session.execute(
            select(Rol).where(Rol.empresa_id == empresa_id, Rol.nombre == nombre)
        )
        rol = result.scalars().first()
        if rol:
            if not rol.activo:
                rol.activo = True
            if descripcion and rol.descripcion != descripcion:
                rol.descripcion = descripcion
            return rol
        rol = Rol(
            empresa_id=empresa_id,
            nombre=nombre,
            descripcion=descripcion,
            activo=True,
        )
        self.session.add(rol)
        await self.session.flush()
        return rol

    async def ids_por_codigos(self, empresa_id: int, codigos: list[str]) -> list[int]:
        if not codigos:
            return []
        result = await self.session.execute(
            select(Permiso.id).where(
                Permiso.empresa_id == empresa_id,
                Permiso.codigo.in_(codigos),
                Permiso.activo == True,
            )
        )
        return [row[0] for row in result.all()]

    async def reemplazar_rol_permiso(self, rol_id: int, permiso_ids: list[int]) -> None:
        await self.session.execute(delete(RolPermiso).where(RolPermiso.rol_id == rol_id))
        for permiso_id in permiso_ids:
            self.session.add(RolPermiso(rol_id=rol_id, permiso_id=permiso_id, activo=True))

    async def listar_cargos_activos(self, empresa_id: int) -> list[Cargo]:
        result = await self.session.execute(
            select(Cargo).where(Cargo.empresa_id == empresa_id, Cargo.activo == True)
        )
        return list(result.scalars().all())

    async def asegurar_cargo(self, empresa_id: int, nombre: str) -> Cargo:
        result = await self.session.execute(
            select(Cargo).where(Cargo.empresa_id == empresa_id, Cargo.nombre == nombre)
        )
        cargo = result.scalars().first()
        if cargo:
            if not cargo.activo:
                cargo.activo = True
            return cargo
        cargo = Cargo(empresa_id=empresa_id, nombre=nombre, activo=True)
        self.session.add(cargo)
        await self.session.flush()
        return cargo

    async def nombres_roles_de_cargo(self, cargo_id: int) -> list[str]:
        stmt = (
            select(Rol.nombre)
            .join(PermisoCargo, PermisoCargo.rol_id == Rol.id)
            .where(
                PermisoCargo.cargo_id == cargo_id,
                PermisoCargo.activo == True,
                Rol.activo == True,
            )
            .order_by(Rol.nombre)
        )
        result = await self.session.execute(stmt)
        return [row[0] for row in result.all()]

    async def obtener_rol_por_nombre(self, empresa_id: int, nombre: str) -> Rol | None:
        result = await self.session.execute(
            select(Rol).where(
                Rol.empresa_id == empresa_id,
                Rol.nombre == nombre,
                Rol.activo == True,
            )
        )
        return result.scalars().first()

    async def asegurar_permiso_cargo(self, cargo_id: int, rol_id: int) -> None:
        result = await self.session.execute(
            select(PermisoCargo).where(
                PermisoCargo.cargo_id == cargo_id,
                PermisoCargo.rol_id == rol_id,
            )
        )
        row = result.scalars().first()
        if row:
            if not row.activo:
                row.activo = True
            return
        self.session.add(PermisoCargo(cargo_id=cargo_id, rol_id=rol_id, activo=True))

    async def vincular_empresa_administrada(
        self, empresa_maestra_id: int, empresa_hija_id: int
    ) -> None:
        if empresa_maestra_id == empresa_hija_id:
            return
        result = await self.session.execute(
            select(EmpresaAdministrada).where(
                EmpresaAdministrada.empresa_maestra_id == empresa_maestra_id,
                EmpresaAdministrada.empresa_administrada_id == empresa_hija_id,
            )
        )
        if result.scalars().first():
            return
        self.session.add(
            EmpresaAdministrada(
                empresa_maestra_id=empresa_maestra_id,
                empresa_administrada_id=empresa_hija_id,
                activo=True,
            )
        )
        await self.session.flush()

    async def usuarios_sin_roles_con_cargo(self, empresa_id: int) -> list[tuple[int, int]]:
        stmt = (
            select(Usuario.id, Usuario.cargo_id)
            .where(
                Usuario.empresa_id == empresa_id,
                Usuario.activo == True,
                Usuario.cargo_id.isnot(None),
            )
        )
        rows = (await self.session.execute(stmt)).all()
        sin_roles: list[tuple[int, int]] = []
        for usuario_id, cargo_id in rows:
            tiene = await self.session.execute(
                select(UsuarioRol.rol_id).where(
                    UsuarioRol.usuario_id == usuario_id,
                    UsuarioRol.activo == True,
                )
            )
            if not tiene.first():
                sin_roles.append((usuario_id, cargo_id))
        return sin_roles

    async def roles_de_cargo(self, cargo_id: int, empresa_id: int) -> list[int]:
        stmt = (
            select(PermisoCargo.rol_id)
            .join(Cargo, PermisoCargo.cargo_id == Cargo.id)
            .join(Rol, PermisoCargo.rol_id == Rol.id)
            .where(
                PermisoCargo.cargo_id == cargo_id,
                Cargo.empresa_id == empresa_id,
                Cargo.activo == True,
                Rol.activo == True,
                PermisoCargo.activo == True,
            )
        )
        result = await self.session.execute(stmt)
        return sorted({row[0] for row in result.all()})

    async def asignar_roles_usuario(self, usuario_id: int, rol_ids: list[int]) -> None:
        for rol_id in rol_ids:
            existente = await self.session.execute(
                select(UsuarioRol).where(
                    UsuarioRol.usuario_id == usuario_id,
                    UsuarioRol.rol_id == rol_id,
                )
            )
            row = existente.scalars().first()
            if row:
                if not row.activo:
                    row.activo = True
            else:
                self.session.add(
                    UsuarioRol(usuario_id=usuario_id, rol_id=rol_id, activo=True)
                )

    async def commit(self) -> None:
        await self.session.commit()

    async def rollback(self) -> None:
        await self.session.rollback()
