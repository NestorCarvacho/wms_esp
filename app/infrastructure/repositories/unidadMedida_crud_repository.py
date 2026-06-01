"""
Repositorio CRUD de Unidad de Medida (Capa de Datos).
CRUD con filtrado automático por empresa_id.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import UnidadMedida
from app.infrastructure.repositories.listado_helpers import condicion_buscar, filtro_empresa


class UnidadMedidaCRUDRepository:
    """Acceso a datos de unidades de medida con aislamiento multi-tenant."""
    
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
    ) -> tuple[list[UnidadMedida], int]:
        """
        Lista unidades de medida de una empresa con paginación.
        
        Args:
            empresa_id: ID de la empresa (multi-tenant)
            pagina: Número de página (desde 1)
            por_pagina: Unidades de medida por página
            es_super_admin: Si True, lista TODOS las unidades de medida de todas las empresas
            
        Returns:
            Tupla (lista_unidades_medida, total_unidades_medida)
        """
        try:
            # Construir statement base
            stmt_base = select(UnidadMedida).options(selectinload(UnidadMedida.empresa))
            
            empresa_cond = filtro_empresa(UnidadMedida, empresa_id, es_super_admin, empresa_id_filtro)
            if empresa_cond is not None:
                stmt_base = stmt_base.where(empresa_cond)

            stmt_base = stmt_base.where(UnidadMedida.activo == True)
            buscar_cond = condicion_buscar(UnidadMedida, buscar, "nombre", "codigo")
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)

            count_stmt = select(func.count(UnidadMedida.id)).where(UnidadMedida.activo == True)
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
            unidades_medida = result.scalars().all()
            return unidades_medida, total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar unidades de medida: {str(e)}")

#     CREATE TABLE `unidad_medida` (
#   `id` bigint NOT NULL AUTO_INCREMENT,
#   `empresa_id` bigint NOT NULL,
#   `sku` varchar(100) NOT NULL,
#   `nombre` varchar(255) NOT NULL,
#   `unidad_medida_id` bigint NOT NULL,
#   `precio_costo` decimal(12,2) DEFAULT NULL,
#   `activo` tinyint(1) DEFAULT '1',
#   PRIMARY KEY (`id`),
#   KEY `empresa_id` (`empresa_id`),
#   KEY `unidad_medida_id` (`unidad_medida_id`),
#   CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id`),
#   CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`unidad_medida_id`) REFERENCES `unidad_medida` (`id`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


    async def obtener_por_id(self, id: int, 
                             empresa_id: int = None,
                             activo: bool = None) -> UnidadMedida | None:
        """
        Obtiene una producto por ID, filtrando por empresa.
        Si empresa_id es None, obtiene la producto sin filtrar por empresa (super admin).
        """
        stmt = select(UnidadMedida).where(UnidadMedida.id == id)
        
        # Agregar filtro de empresa si se proporciona
        if empresa_id is not None:
            stmt = stmt.where(UnidadMedida.empresa_id == empresa_id)
        
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_codigo(self, codigo: str, empresa_id: int) -> UnidadMedida | None:
        """
        Obtiene una unidad de medida por código, filtrando por empresa.
        """
        stmt = select(UnidadMedida).where(
            UnidadMedida.codigo == codigo,
            UnidadMedida.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> UnidadMedida | None:
        """
        Obtiene una unidad de medida por nombre, filtrando por empresa.
        """
        stmt = select(UnidadMedida).where(
            UnidadMedida.nombre == nombre,
            UnidadMedida.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def crear(
        self,
        empresa_id: int,
        nombre: str,
        codigo: str,
        activo: bool = True
    ) -> UnidadMedida:
        """
        Crea un nuevo producto.
        """
        try:
            nueva_unidad_medida = UnidadMedida(
                empresa_id=empresa_id,
                nombre=nombre,
                codigo=codigo,
                activo=activo
            )
            self.session.add(nueva_unidad_medida)
            await self.session.commit()
            await self.session.refresh(nueva_unidad_medida)
            return nueva_unidad_medida
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear unidad de medida: {str(e)}")

    async def actualizar(self, 
                         producto_id: int, 
                         empresa_id: int, 
                         nombre: str, 
                         codigo: str, 
                         activo: bool= True ) -> UnidadMedida | None:
        """
        Actualiza una unidad de medida existente.
        
        Args:
            producto_id: ID de la unidad de medida
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre de la unidad de medida
            codigo: Nuevo código de la unidad de medida
            activo: Nuevo estado de la unidad de medida
        """

        try:
            # Validar que la unidad de medida existe y pertenece a la empresa
            unidad_medida = await self.obtener_por_id(producto_id, empresa_id)
            if not unidad_medida:
                raise ValueError("UnidadMedida no encontrado")
            
            # Preparar datos a actualizar
            datos_actualizar = {}
            if nombre is not None:
                datos_actualizar["nombre"] = nombre
            if codigo is not None:
                datos_actualizar["codigo"] = codigo
            if activo is not None:
                datos_actualizar["activo"] = activo

            if not datos_actualizar:
                return unidad_medida
            
            # Actualizar solo por id y empresa_id
            stmt = update(UnidadMedida).where(
                and_(UnidadMedida.id == producto_id, 
                     UnidadMedida.empresa_id == empresa_id)
            ).values(**datos_actualizar)
            
            await self.session.execute(stmt)
            await self.session.commit()
            
            # Retornar producto actualizado
            return await self.obtener_por_id(producto_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar unidad de medida: {str(e)}")

    async def eliminar(self, unidad_medida_id: int, empresa_id: int) -> bool:
        """
        Elimina (desactiva) una unidad de medida (soft delete).
        """
        try:
            unidad_medida = await self.obtener_por_id(unidad_medida_id, empresa_id)
            if not unidad_medida:
                raise ValueError("UnidadMedida no encontrado")
            
            stmt = update(UnidadMedida).where(
                and_(UnidadMedida.id == unidad_medida_id, UnidadMedida.empresa_id == empresa_id)
            ).values(activo=False)
            
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar unidad de medida: {str(e)}")