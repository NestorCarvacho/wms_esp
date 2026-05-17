"""
Repositorio CRUD de Productos (Capa de Datos).
CRUD con filtrado automático por empresa_id.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import Producto


class ProductoCRUDRepository:
    """Acceso a datos de productos con aislamiento multi-tenant."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False
    ) -> tuple[list[Producto], int]:
        """
        Lista productos de una empresa con paginación.
        
        Args:
            empresa_id: ID de la empresa (multi-tenant)
            pagina: Número de página (desde 1)
            por_pagina: Productos por página
            es_super_admin: Si True, lista TODOS los productos de todas las empresas
            
        Returns:
            Tupla (lista_productos, total_productos)
        """
        try:
            # Construir statement base
            stmt_base = select(Producto)
            
            # Agregar filtro de empresa si no es super admin
            if not es_super_admin:
                stmt_base = stmt_base.where(Producto.empresa_id == empresa_id)
            
            # Filtrar solo activos
            stmt_base = stmt_base.where(Producto.activo == True)
            
            # Contar total
            count_stmt = select(func.count(Producto.id))
            if not es_super_admin:
                count_stmt = count_stmt.where(Producto.empresa_id == empresa_id)
            count_stmt = count_stmt.where(Producto.activo == True)
            
            count_result = await self.session.execute(count_stmt)
            total = count_result.scalar() or 0
            
            # Listar con paginación
            offset = (pagina - 1) * por_pagina
            stmt = stmt_base.offset(offset).limit(por_pagina)
            
            result = await self.session.execute(stmt)
            productos = result.scalars().all()
            return productos, total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar productos: {str(e)}")
    
#     CREATE TABLE `producto` (
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
                             activo: bool = None) -> Producto | None:
        """
        Obtiene una producto por ID, filtrando por empresa.
        Si empresa_id es None, obtiene la producto sin filtrar por empresa (super admin).
        """
        stmt = select(Producto).where(Producto.id == id)
        
        # Agregar filtro de empresa si se proporciona
        if empresa_id is not None:
            stmt = stmt.where(Producto.empresa_id == empresa_id)
        
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_sku(self, sku: str, empresa_id: int) -> Producto | None:
        """
        Obtiene una producto por código, filtrando por empresa.
        """
        stmt = select(Producto).where(
            Producto.sku == sku,
            Producto.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def obtener_por_nombre(self, nombre: str, empresa_id: int) -> Producto | None:
        """
        Obtiene un producto por nombre, filtrando por empresa.
        """
        stmt = select(Producto).where(
            Producto.nombre == nombre,
            Producto.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
#   "nombre": "Caja clavos",
#   "sku": "CLAV0001",
#   "activo": 1,
#   "unidad_medida_id": 3,
#   "precio_costo": 1200

    async def crear(
        self,
        empresa_id: int,
        nombre: str,
        sku: str,
        activo: bool = True,
        unidad_medida_id: int = None,
        precio_costo: float = None
    ) -> Producto:
        """
        Crea un nuevo producto.
        """
        try:
            nuevo_producto = Producto(
                empresa_id=empresa_id,
                nombre=nombre,
                sku=sku,
                activo=activo,
                unidad_medida_id=unidad_medida_id,
                precio_costo=precio_costo
            )
            self.session.add(nuevo_producto)
            await self.session.commit()
            await self.session.refresh(nuevo_producto)
            return nuevo_producto
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear producto: {str(e)}")

    async def actualizar(self, 
                         producto_id: int, 
                         empresa_id: int, 
                         nombre: str, 
                         sku: str, 
                         activo: bool= True,
                         unidad_medida_id: int = None,
                         precio_costo: float = None ) -> Producto | None:
        """
        Actualiza un producto existente.
        
        Args:
            producto_id: ID del producto
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre del producto
            sku: Nuevo SKU del producto
            activo: Nuevo estado del producto
            unidad_medida_id: Nuevo ID de la unidad de medida
            precio_costo: Nuevo precio de costo del producto
        """

        try:
            # Validar que la producto existe y pertenece a la empresa
            producto = await self.obtener_por_id(producto_id, empresa_id)
            if not producto:
                raise ValueError("Producto no encontrado")
            
            # Preparar datos a actualizar
            datos_actualizar = {}
            if nombre is not None:
                datos_actualizar["nombre"] = nombre
            if sku is not None:
                datos_actualizar["sku"] = sku
            if activo is not None:
                datos_actualizar["activo"] = activo
            if unidad_medida_id is not None:
                datos_actualizar["unidad_medida_id"] = unidad_medida_id
            if precio_costo is not None:
                datos_actualizar["precio_costo"] = precio_costo
            if not datos_actualizar:
                return producto
            
            # Actualizar solo por id y empresa_id
            stmt = update(Producto).where(
                and_(Producto.id == producto_id, 
                     Producto.empresa_id == empresa_id)
            ).values(**datos_actualizar)
            
            await self.session.execute(stmt)
            await self.session.commit()
            
            # Retornar producto actualizado
            return await self.obtener_por_id(producto_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar producto: {str(e)}")
    
    async def eliminar(self, producto_id: int, empresa_id: int) -> bool:
        """
        Elimina (desactiva) un producto (soft delete).
        """
        try:
            producto = await self.obtener_por_id(producto_id, empresa_id)
            if not producto:
                raise ValueError("Producto no encontrado")
            
            stmt = update(Producto).where(
                and_(Producto.id == producto_id, Producto.empresa_id == empresa_id)
            ).values(activo=False)
            
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar producto: {str(e)}")