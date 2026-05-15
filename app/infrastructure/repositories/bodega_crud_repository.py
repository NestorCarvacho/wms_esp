"""
Repositorio CRUD de Bodegas (Capa de Datos).
CRUD con filtrado automático por empresa_id.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import Bodega


class BodegaCRUDRepository:
    """Acceso a datos de bodegas con aislamiento multi-tenant."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False
    ) -> tuple[list[Bodega], int]:
        """
        Lista bodegas de una empresa con paginación.
        
        Args:
            empresa_id: ID de la empresa (multi-tenant)
            pagina: Número de página (desde 1)
            por_pagina: Bodegas por página
            es_super_admin: Si True, lista TODAS las bodegas de todas las empresas
            
        Returns:
            Tupla (lista_bodegas, total_bodegas)
        """
        try:
            # Construir statement base
            stmt_base = select(Bodega)
            
            # Agregar filtro de empresa si no es super admin
            if not es_super_admin:
                stmt_base = stmt_base.where(Bodega.empresa_id == empresa_id)
            
            # Filtrar solo activos
            stmt_base = stmt_base.where(Bodega.activo == True)
            
            # Contar total
            count_stmt = select(func.count(Bodega.id))
            if not es_super_admin:
                count_stmt = count_stmt.where(Bodega.empresa_id == empresa_id)
            count_stmt = count_stmt.where(Bodega.activo == True)
            
            count_result = await self.session.execute(count_stmt)
            total = count_result.scalar() or 0
            
            # Listar con paginación
            offset = (pagina - 1) * por_pagina
            stmt = stmt_base.offset(offset).limit(por_pagina)
            
            result = await self.session.execute(stmt)
            bodegas = result.scalars().all()
            return bodegas, total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar bodegas: {str(e)}")
    
    #"detail": "BodegaCRUDRepository.obtener_por_id() takes from 2 to 3 positional arguments but 5 were given"

    async def obtener_por_id(self, id: int, empresa_id: int = None, codigo: str = None, activo: bool = None) -> Bodega | None:
        """
        Obtiene una bodega por ID, filtrando por empresa.
        Si empresa_id es None, obtiene la bodega sin filtrar por empresa (super admin).
        """
        stmt = select(Bodega).where(Bodega.id == id)
        
        # Agregar filtro de empresa si se proporciona
        if empresa_id is not None:
            stmt = stmt.where(Bodega.empresa_id == empresa_id)
        
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_codigo(self, codigo: str, empresa_id: int) -> Bodega | None:
        """
        Obtiene una bodega por código, filtrando por empresa.
        """
        stmt = select(Bodega).where(
            Bodega.codigo == codigo,
            Bodega.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Bodega | None:
        """
        Obtiene una bodega por nombre, filtrando por empresa.
        """
        stmt = select(Bodega).where(
            Bodega.nombre == nombre,
            Bodega.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def crear(
        self,
        empresa_id: int,
        nombre: str,
        codigo: str,
        activo: bool = True
    ) -> Bodega:
        """
        Crea un nueva bodega.
        """
        try:
            nueva_bodega = Bodega(
                empresa_id=empresa_id,
                nombre=nombre,
                codigo=codigo,
                activo=activo
            )
            self.session.add(nueva_bodega)
            await self.session.commit()
            await self.session.refresh(nueva_bodega)
            return nueva_bodega
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear bodega: {str(e)}")
    
    async def actualizar(self, 
                         bodega_id: int, 
                         empresa_id: int, 
                         nombre: str, 
                         codigo: str, 
                         activo: bool= True ) -> Bodega | None:
        """
        Actualiza una bodega existente.
        
        Args:
            bodega_id: ID de la bodega
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre de la bodega
            codigo: Nuevo código de la bodega
            activo: Nuevo estado de la bodega
        """

        # "detail": "BodegaCRUDRepository.actualizar() missing 1 required positional argument: 'activo'"
        #deberii

        try:
            # Validar que la bodega existe y pertenece a la empresa
            bodega = await self.obtener_por_id(bodega_id, empresa_id)
            if not bodega:
                raise ValueError("Bodega no encontrada")
            
            # Preparar datos a actualizar
            datos_actualizar = {}
            if nombre is not None:
                datos_actualizar["nombre"] = nombre
            if codigo is not None:
                datos_actualizar["codigo"] = codigo
            if activo is not None:
                datos_actualizar["activo"] = activo

            if not datos_actualizar:
                return bodega
            
            # Actualizar solo por id y empresa_id
            stmt = update(Bodega).where(
                and_(Bodega.id == bodega_id, 
                     Bodega.empresa_id == empresa_id)
            ).values(**datos_actualizar)
            
            await self.session.execute(stmt)
            await self.session.commit()
            
            # Retornar bodega actualizada
            return await self.obtener_por_id(bodega_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar bodega: {str(e)}")
    
    async def eliminar(self, bodega_id: int, empresa_id: int) -> bool:
        """
        Elimina (desactiva) una bodega (soft delete).
        """
        try:
            bodega = await self.obtener_por_id(bodega_id, empresa_id)
            if not bodega:
                raise ValueError("Bodega no encontrada")
            
            stmt = update(Bodega).where(
                and_(Bodega.id == bodega_id, Bodega.empresa_id == empresa_id)
            ).values(activo=False)
            
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar bodega: {str(e)}")