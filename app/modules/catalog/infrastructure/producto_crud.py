"""
Repositorio CRUD de Productos (Capa de Datos).
CRUD con filtrado automático por empresa_id.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.infrastructure.models.usuario import Producto
from app.infrastructure.repositories.listado_helpers import aplicar_orden, condicion_buscar, filtro_empresa


class ProductoCRUDRepository:
    """Acceso a datos de productos con aislamiento multi-tenant."""
    
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
        unidad_medida_id: int | None = None,
        tipo_producto_id: int | None = None,
        ordenar_por: str | None = None,
        orden: str | None = None,
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
            stmt_base = select(Producto).options(
                selectinload(Producto.empresa),
                selectinload(Producto.unidad_medida),
                selectinload(Producto.tipo_producto),
            )
            
            empresa_cond = filtro_empresa(
                Producto, empresa_id, es_super_admin, empresa_id_filtro, empresas_scope_ids
            )
            if empresa_cond is not None:
                stmt_base = stmt_base.where(empresa_cond)

            stmt_base = stmt_base.where(Producto.activo == True)
            buscar_cond = condicion_buscar(Producto, buscar, "nombre", "sku")
            if buscar_cond is not None:
                stmt_base = stmt_base.where(buscar_cond)
            if unidad_medida_id is not None:
                stmt_base = stmt_base.where(Producto.unidad_medida_id == unidad_medida_id)
            if tipo_producto_id is not None:
                stmt_base = stmt_base.where(Producto.tipo_producto_id == tipo_producto_id)

            count_stmt = select(func.count(Producto.id)).where(Producto.activo == True)
            if empresa_cond is not None:
                count_stmt = count_stmt.where(empresa_cond)
            if buscar_cond is not None:
                count_stmt = count_stmt.where(buscar_cond)
            if unidad_medida_id is not None:
                count_stmt = count_stmt.where(Producto.unidad_medida_id == unidad_medida_id)
            if tipo_producto_id is not None:
                count_stmt = count_stmt.where(Producto.tipo_producto_id == tipo_producto_id)
            
            count_result = await self.session.execute(count_stmt)
            total = count_result.scalar() or 0
            
            stmt_base = aplicar_orden(
                stmt_base,
                columnas={
                    "id": Producto.id,
                    "nombre": Producto.nombre,
                    "sku": Producto.sku,
                    "activo": Producto.activo,
                    "empresa_id": Producto.empresa_id,
                },
                ordenar_por=ordenar_por,
                orden=orden,
                default=Producto.nombre,
            )

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
        tipo_producto_id: int | None = None,
        precio_costo: float = None,
        serializado: bool = False,
        stock_minimo: float | None = None,
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
                tipo_producto_id=tipo_producto_id,
                precio_costo=precio_costo,
                serializado=serializado,
                stock_minimo=stock_minimo,
            )
            self.session.add(nuevo_producto)
            await self.session.commit()
            await self.session.refresh(nuevo_producto)
            return nuevo_producto
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear producto: {str(e)}")

    async def crear_masivo(self, items: list[dict]) -> int:
        """Inserta varios productos en una sola transacción."""
        if not items:
            return 0
        try:
            objetos = [Producto(**item) for item in items]
            self.session.add_all(objetos)
            await self.session.commit()
            return len(objetos)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al importar productos: {str(e)}")

    async def actualizar(self, 
                         producto_id: int, 
                         empresa_id: int, 
                         nombre: str, 
                         sku: str, 
                         activo: bool= True,
                         unidad_medida_id: int = None,
                         tipo_producto_id: int | None = None,
                         precio_costo: float = None,
                         actualizar_tipo_producto: bool = False,
                         serializado: bool | None = None,
                         stock_minimo: float | None = None,
                         actualizar_stock_minimo: bool = False) -> Producto | None:
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
            if actualizar_tipo_producto:
                datos_actualizar["tipo_producto_id"] = tipo_producto_id
            elif tipo_producto_id is not None:
                datos_actualizar["tipo_producto_id"] = tipo_producto_id
            if precio_costo is not None:
                datos_actualizar["precio_costo"] = precio_costo
            if serializado is not None:
                datos_actualizar["serializado"] = serializado
            if actualizar_stock_minimo:
                datos_actualizar["stock_minimo"] = stock_minimo
            elif stock_minimo is not None:
                datos_actualizar["stock_minimo"] = stock_minimo
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

    async def listar_skus_y_nombres_empresa(self, empresa_id: int) -> tuple[set[str], set[str]]:
        stmt = select(Producto.sku, Producto.nombre).where(Producto.empresa_id == empresa_id)
        result = await self.session.execute(stmt)
        rows = result.all()
        return {r[0] for r in rows if r[0]}, {r[1] for r in rows if r[1]}

    async def listar_codigos_barras_empresa(self, empresa_id: int) -> set[str]:
        from app.infrastructure.models.usuario import ProductoPresentacion

        stmt = (
            select(ProductoPresentacion.codigo_barras)
            .join(Producto, ProductoPresentacion.producto_id == Producto.id)
            .where(
                Producto.empresa_id == empresa_id,
                ProductoPresentacion.activo == True,
                ProductoPresentacion.codigo_barras.isnot(None),
            )
        )
        result = await self.session.execute(stmt)
        return {r[0] for r in result.all() if r[0]}

    async def mapa_ids_por_skus(self, empresa_id: int, skus: set[str]) -> dict[str, int]:
        if not skus:
            return {}
        stmt = select(Producto.sku, Producto.id).where(
            Producto.empresa_id == empresa_id,
            Producto.sku.in_(list(skus)),
        )
        result = await self.session.execute(stmt)
        return {row[0]: int(row[1]) for row in result.all()}