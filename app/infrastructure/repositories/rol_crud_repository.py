"""
Repositorio CRUD de Roles (Capa de Datos).
CRUD con filtrado automático por empresa_id.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import Rol


class RolCRUDRepository:
    """Acceso a datos de roles con aislamiento multi-tenant."""

    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False
    ) -> tuple[list[Rol], int]:
        """
        Lista roles de una empresa con paginación.
        
        Args:
            empresa_id: ID de la empresa (multi-tenant)
            pagina: Número de página (desde 1)
            por_pagina: Roles por página
            es_super_admin: Si True, lista TODOS los roles de todas las empresas
            
        Returns:
            Tupla (lista_roles, total_roles)
        """
        try:
            # Construir statement base
            stmt_base = select(Rol)
            
            # Agregar filtro de empresa si no es super admin
            if not es_super_admin:
                stmt_base = stmt_base.where(Rol.empresa_id == empresa_id)
            
            # Filtrar solo activos
            stmt_base = stmt_base.where(Rol.activo == True)
            
            # Contar total
            count_stmt = select(func.count(Rol.id))
            if not es_super_admin:
                count_stmt = count_stmt.where(Rol.empresa_id == empresa_id)
            count_stmt = count_stmt.where(Rol.activo == True)
            
            count_result = await self.session.execute(count_stmt)
            total = count_result.scalar() or 0
            
            # Listar con paginación
            offset = (pagina - 1) * por_pagina
            stmt = stmt_base.offset(offset).limit(por_pagina)
            
            result = await self.session.execute(stmt)
            roles = result.scalars().all()
            return roles, total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar roles: {str(e)}")
    
    async def obtener_por_id(self, id: int, empresa_id: int = None) -> Rol | None:
        """
        Obtiene un rol por ID, filtrando por empresa.
        Si empresa_id es None, obtiene el rol sin filtrar por empresa (super admin).
        """
        stmt = select(Rol).where(Rol.id == id)
        
        # Agregar filtro de empresa si se proporciona
        if empresa_id is not None:
            stmt = stmt.where(Rol.empresa_id == empresa_id)
        
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Rol | None:
        """
        Obtiene un rol por nombre, filtrando por empresa.
        """
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
        cargo_id: int,
        descripcion: str = None,
        activo: bool = True
        
    ) -> Rol:
        """
        Crea un nuevo rol.
        """
        try:
            nuevo_rol = Rol(
                empresa_id=empresa_id,
                nombre=nombre,
                cargo_id=cargo_id,
                descripcion=descripcion,
                activo=activo
            )
            self.session.add(nuevo_rol)
            await self.session.commit()
            await self.session.refresh(nuevo_rol)
            return nuevo_rol
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear rol: {str(e)}")
    
    async def actualizar(self, rol_id: int, empresa_id: int, nombre: str = None, cargo_id: int = None, descripcion: str = None, activo: bool = None) -> Rol | None:
        """
        Actualiza un rol existente.
        
        Args:
            rol_id: ID del rol
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre del rol
            cargo_id: Nuevo ID del cargo
            descripcion: Nueva descripción del rol
            activo: Nuevo estado del rol
        """
        try:
            # Validar que el rol existe y pertenece a la empresa
            rol = await self.obtener_por_id(rol_id, empresa_id)
            if not rol:
                raise ValueError("Rol no encontrado")
            
            # Preparar datos a actualizar
            datos_actualizar = {}
            if nombre is not None:
                datos_actualizar["nombre"] = nombre
            if cargo_id is not None:
                datos_actualizar["cargo_id"] = cargo_id
            if descripcion is not None:
                datos_actualizar["descripcion"] = descripcion
            if activo is not None:
                datos_actualizar["activo"] = activo

            if not datos_actualizar:
                return rol
            
            # Ejecutar actualización
            stmt = update(Rol).where(
                and_(Rol.id == rol_id, Rol.empresa_id == empresa_id)
            ).values(**datos_actualizar)
            
            await self.session.execute(stmt)
            await self.session.commit()
            
            # Retornar rol actualizado
            return await self.obtener_por_id(rol_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar rol: {str(e)}")

    async def eliminar(self, rol_id: int, empresa_id: int) -> bool:
        """
        Elimina (desactiva) un rol (soft delete).
        """
        try:
            rol = await self.obtener_por_id(rol_id, empresa_id)
            if not rol:
                raise ValueError("Rol no encontrado")
            
            stmt = update(Rol).where(
                and_(Rol.id == rol_id, Rol.empresa_id == empresa_id)
            ).values(activo=False)
            
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar rol: {str(e)}")
