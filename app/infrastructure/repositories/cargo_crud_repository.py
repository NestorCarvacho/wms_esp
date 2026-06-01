"""
Repositorio CRUD de Cargos (Capa de Datos).
CRUD con filtrado automático por empresa_id.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import Cargo
from app.infrastructure.repositories.listado_helpers import condicion_buscar, filtro_empresa


class CargoCRUDRepository:
    """Acceso a datos de cargos con aislamiento multi-tenant."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        buscar: str | None = None,
    ) -> tuple[list[Cargo], int]:
        """
        Lista cargos de una empresa con paginación.
        
        Args:
            empresa_id: ID de la empresa (multi-tenant)
            pagina: Número de página (desde 1)
            por_pagina: Cargos por página
            es_super_admin: Si True, lista TODOS los cargos de todas las empresas
            
        Returns:
            Tupla (lista_cargos, total_cargos)
        """
        try:
            # Construir statement base
            stmt_base = select(Cargo).options(selectinload(Cargo.empresa))
            
            empresa_cond = filtro_empresa(Cargo, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids)
            if empresa_cond is not None:
                stmt_base = stmt_base.where(empresa_cond)

            stmt_base = stmt_base.where(Cargo.activo == True)
            buscar_cond = condicion_buscar(Cargo, buscar, "nombre")
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)

            count_stmt = select(func.count(Cargo.id)).where(Cargo.activo == True)
            if empresa_cond is not None:
                count_stmt = count_stmt.where(empresa_cond)
            if buscar_cond is not None:
                count_stmt = count_stmt.where(buscar_cond)
            
            count_result = await self.session.execute(count_stmt)
            total = count_result.scalar() or 0
            
            # Listar con paginación
            offset = (pagina - 1) * por_pagina
            stmt = stmt_base.offset(offset).limit(por_pagina)
            
            result = await self.session.execute(stmt)
            cargos = result.scalars().all()
            return cargos, total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar cargos: {str(e)}")
    
    async def obtener_por_id(self, id: int, empresa_id: int = None) -> Cargo | None:
        """
        Obtiene un cargo por ID, filtrando por empresa.
        Si empresa_id es None, obtiene el cargo sin filtrar por empresa (super admin).
        """
        stmt = select(Cargo).where(Cargo.id == id)
        
        # Agregar filtro de empresa si se proporciona
        if empresa_id is not None:
            stmt = stmt.where(Cargo.empresa_id == empresa_id)
        
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Cargo | None:
        """
        Obtiene un cargo por nombre, filtrando por empresa.
        """
        stmt = select(Cargo).where(
            Cargo.nombre == nombre,
            Cargo.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def crear(
        self,
        empresa_id: int,
        nombre: str
    ) -> Cargo:
        """
        Crea un nuevo cargo.
        """
        try:
            nuevo_cargo = Cargo(
                empresa_id=empresa_id,
                nombre=nombre
            )
            self.session.add(nuevo_cargo)
            await self.session.commit()
            await self.session.refresh(nuevo_cargo)
            return nuevo_cargo
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear cargo: {str(e)}")
    
    async def actualizar(self, cargo_id: int, empresa_id: int, nombre: str = None) -> Cargo | None:
        """
        Actualiza un cargo existente.
        
        Args:
            cargo_id: ID del cargo
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre del cargo
        """
        try:
            # Validar que el cargo existe y pertenece a la empresa
            cargo = await self.obtener_por_id(cargo_id, empresa_id)
            if not cargo:
                raise ValueError("Cargo no encontrado")
            
            # Preparar datos a actualizar
            datos_actualizar = {}
            if nombre is not None:
                datos_actualizar["nombre"] = nombre
            
            if not datos_actualizar:
                return cargo
            
            # Ejecutar actualización
            stmt = update(Cargo).where(
                and_(Cargo.id == cargo_id, Cargo.empresa_id == empresa_id)
            ).values(**datos_actualizar)
            
            await self.session.execute(stmt)
            await self.session.commit()
            
            # Retornar cargo actualizado
            return await self.obtener_por_id(cargo_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar cargo: {str(e)}")
    
    async def eliminar(self, cargo_id: int, empresa_id: int) -> bool:
        """
        Elimina (desactiva) un cargo (soft delete).
        """
        try:
            cargo = await self.obtener_por_id(cargo_id, empresa_id)
            if not cargo:
                raise ValueError("Cargo no encontrado")
            
            stmt = update(Cargo).where(
                and_(Cargo.id == cargo_id, Cargo.empresa_id == empresa_id)
            ).values(activo=False)
            
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar cargo: {str(e)}")
