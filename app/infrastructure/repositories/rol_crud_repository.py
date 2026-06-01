"""
Repositorio CRUD de Roles (Capa de Datos).
CRUD con filtrado automático por empresa_id.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload
from app.infrastructure.models.usuario import Rol
from app.infrastructure.repositories.listado_helpers import condicion_buscar, filtro_empresa


class RolCRUDRepository:
    """Acceso a datos de roles con aislamiento multi-tenant."""

    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        buscar: str | None = None,
    ) -> tuple[list[Rol], int]:

        try:
            stmt_base = select(Rol).options(selectinload(Rol.empresa))

            empresa_cond = filtro_empresa(Rol, empresa_id, es_super_admin, empresa_id_filtro)
            if empresa_cond is not None:
                stmt_base = stmt_base.where(empresa_cond)

            stmt_base = stmt_base.where(Rol.activo == True)
            buscar_cond = condicion_buscar(Rol, buscar, "nombre", "descripcion")
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)

            count_stmt = select(func.count(Rol.id)).where(Rol.activo == True)
            if empresa_cond is not None:
                count_stmt = count_stmt.where(empresa_cond)
            if buscar_cond is not None:
                count_stmt = count_stmt.where(buscar_cond)

            total = (await self.session.execute(count_stmt)).scalar() or 0
            offset = (pagina - 1) * por_pagina
            result = await self.session.execute(stmt_base.offset(offset).limit(por_pagina))
            return result.scalars().all(), total

        except SQLAlchemyError as e:
            raise Exception(f"Error al listar roles: {str(e)}")
    
    async def obtener_por_id(self, id: int, empresa_id: int = None) -> Rol | None:
        stmt = select(Rol).where(Rol.id == id)
        if empresa_id is not None:
            stmt = stmt.where(Rol.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Rol | None:
        stmt = select(Rol).where(
            Rol.nombre == nombre,
            Rol.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def crear(
        self,
        empresa_id: int,
        nombre: str,
        descripcion: str = None,
        activo: bool = True,
    ) -> Rol:
        try:
            nuevo_rol = Rol(
                empresa_id=empresa_id,
                nombre=nombre,
                descripcion=descripcion,
                activo=activo,
            )
            self.session.add(nuevo_rol)
            await self.session.commit()
            await self.session.refresh(nuevo_rol)
            return nuevo_rol
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear rol: {str(e)}")
    
    async def actualizar(
        self,
        rol_id: int,
        empresa_id: int,
        nombre: str = None,
        descripcion: str = None,
        activo: bool = None,
    ) -> Rol | None:
        try:
            rol = await self.obtener_por_id(rol_id, empresa_id)
            if not rol:
                raise ValueError("Rol no encontrado")
            
            datos_actualizar = {}
            if nombre is not None:
                datos_actualizar["nombre"] = nombre
            if descripcion is not None:
                datos_actualizar["descripcion"] = descripcion
            if activo is not None:
                datos_actualizar["activo"] = activo

            if not datos_actualizar:
                return rol
            
            await self.session.execute(
                update(Rol).where(and_(Rol.id == rol_id, Rol.empresa_id == empresa_id)).values(**datos_actualizar)
            )
            await self.session.commit()
            return await self.obtener_por_id(rol_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar rol: {str(e)}")

    async def eliminar(self, rol_id: int, empresa_id: int) -> bool:
        try:
            rol = await self.obtener_por_id(rol_id, empresa_id)
            if not rol:
                raise ValueError("Rol no encontrado")
            
            await self.session.execute(
                update(Rol).where(and_(Rol.id == rol_id, Rol.empresa_id == empresa_id)).values(activo=False)
            )
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar rol: {str(e)}")
