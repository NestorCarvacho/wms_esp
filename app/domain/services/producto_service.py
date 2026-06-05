"""
Servicio CRUD de Productos (Capa de Negocio).
Orquesta la lógica de negocio para operaciones CRUD.
"""
from typing import Dict, Any
from app.infrastructure.repositories.producto_crud_repository import ProductoCRUDRepository
from app.domain.services.display_helpers import format_empresa_nombre


class ProductoService:
    """Servicio CRUD de productos con validaciones de negocio."""
    
    def __init__(self, repository: ProductoCRUDRepository):
        self.repository = repository
    
    async def listar_productos(
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
    ) -> Dict[str, Any]:
        """
        Lista productos de una empresa.
        
        Args:
            empresa_id: ID de la empresa
            pagina: Número de página
            por_pagina: Productos por página
            es_super_admin: Si True, lista productos de TODAS las empresas
            
        Returns:
            Dict con total, página actual, productos por página y lista de productos
        """
        productos, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            empresa_id_filtro=empresa_id_filtro,
            empresas_scope_ids=empresas_scope_ids,
            buscar=buscar,
            unidad_medida_id=unidad_medida_id,
            tipo_producto_id=tipo_producto_id,
            ordenar_por=ordenar_por,
            orden=orden,
        )
        
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "productos": [
                {
                    "id": b.id,
                    "nombre": b.nombre,
                    "empresa_id": b.empresa_id,
                    "empresa_nombre": format_empresa_nombre(b.empresa),
                    "sku": b.sku,
                    "activo": b.activo,
                    "unidad_medida_id": b.unidad_medida_id,
                    "unidad_medida_nombre": b.unidad_medida.nombre if b.unidad_medida else None,
                    "tipo_producto_id": b.tipo_producto_id,
                    "tipo_producto_nombre": b.tipo_producto.nombre if b.tipo_producto else None,
                    "precio_costo": float(b.precio_costo) if b.precio_costo is not None else None,
                }
                for b in productos
            ]
        }
    
    async def obtener_producto(self, producto_id: int, empresa_id: int = None) -> Dict[str, Any]:
        """
        Obtiene una producto específica.
        Si empresa_id es None, obtiene sin filtrar por empresa (super admin).
        
        Args:
            producto_id: ID de el producto
            empresa_id: ID de la empresa (para filtrado multi-tenant)
            
        Raises:
            ValueError: Si el producto no existe
        """
        producto = await self.repository.obtener_por_id(producto_id, empresa_id)
        if not producto:
            raise ValueError("Producto no encontrada")
        
        return {
            "id": producto.id,
            "empresa_id": producto.empresa_id,
            "nombre": producto.nombre,
            "sku": producto.sku
        }
    
    async def crear_producto(
        self,
        empresa_id: int,
        nombre: str,
        sku: str,
        activo: bool = True,
        unidad_medida_id: int = None,
        tipo_producto_id: int | None = None,
        precio_costo: float = None
    ) -> Dict[str, Any]:
        """
        Crea una nueva producto.
        
        Args:
            empresa_id: ID de la empresa
            nombre: Nombre de producto
            sku: Código de el producto
            activo: Estado de el producto
            unidad_medida_id: ID de la unidad de medida
            precio_costo: Precio de costo de el producto
        Returns:
            Dict con datos de el producto creada
            
        Raises:
            ValueError: Si el nombre ya existe en la empresa
        """
        # Validar que el nombre no esté vacío
        if not nombre or not nombre.strip():
            raise ValueError("El nombre de el producto no puede estar vacío")
        
        #validar que el el sku no esté vacío
        if not sku or not sku.strip():
            raise ValueError("El código de el producto no puede estar vacío")

        nombre = nombre.strip()
        sku = sku.strip()
        
        # Validar que el nombre sea único por empresa
        producto_existente = await self.repository.obtener_por_nombre(nombre, empresa_id)
        if producto_existente:
            raise ValueError(f"Ya existe una producto con el nombre '{nombre}' en esta empresa")
        
        # Crear producto
        nuevo_producto = await self.repository.crear(
            empresa_id, nombre, sku, activo, unidad_medida_id, tipo_producto_id, precio_costo
        )
        
        return {
            "id": nuevo_producto.id,
            "empresa_id": nuevo_producto.empresa_id,
            "nombre": nuevo_producto.nombre,
            "sku": nuevo_producto.sku,
            "activo": nuevo_producto.activo,
            "unidad_medida_id": nuevo_producto.unidad_medida_id,
            "tipo_producto_id": nuevo_producto.tipo_producto_id,
            "precio_costo": nuevo_producto.precio_costo
        }
    
    async def actualizar_producto(
        self,
        producto_id: int,
        empresa_id: int,
        nombre: str = None,
        sku: str = None,
        unidad_medida_id: int = None,
        tipo_producto_id: int | None = None,
        actualizar_tipo_producto: bool = False,
        precio_costo: float = None,
        activo: bool | None = None,
    ) -> Dict[str, Any]:
        """
        Actualiza una producto existente.
        
        Args:
            producto_id: ID de el producto
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre de el producto
            sku: Nuevo código de el producto
            unidad_medida_id: Nuevo ID de la unidad de medida
            precio_costo: Nuevo precio de costo de el producto
            
        Returns:
            Dict con datos de el producto actualizada
            
        Raises:
            ValueError: Si el producto no existe o si el nombre es duplicado
        """
        # Validar que el producto existe
        producto_existente = await self.repository.obtener_por_id(producto_id, empresa_id)
        if not producto_existente:
            raise ValueError("Producto no encontrada")
        
        # Validar que la ell sku de el producto no exista
        if sku is not None and sku.strip():
            sku = sku.strip()
            
            # Verificar que el nuevo código no exista (excepto el actual)
            producto_con_sku = await self.repository.obtener_por_sku(sku, empresa_id)
            if producto_con_sku and producto_con_sku.id != producto_id:
                raise ValueError(f"Ya existe una producto con el código '{sku}' en esta empresa")
        
        # Si se actualiza el nombre, validar unicidad
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            
            # Verificar que el nuevo nombre no exista (excepto el actual)
            producto_con_nombre = await self.repository.obtener_por_nombre(nombre, empresa_id)
            if producto_con_nombre and producto_con_nombre.id != producto_id:
                raise ValueError(f"Ya existe una producto con el nombre '{nombre}' en esta empresa")
        
        # Actualizar producto (preservar activo si no se envía)
        activo_efectivo = producto_existente.activo if activo is None else activo
        producto_actualizada = await self.repository.actualizar(
            producto_id,
            empresa_id,
            nombre,
            sku,
            activo_efectivo,
            unidad_medida_id,
            tipo_producto_id,
            precio_costo,
            actualizar_tipo_producto=actualizar_tipo_producto,
        )

        if not producto_actualizada:
            raise ValueError("Error al actualizar el producto")
        
        return {
            "id": producto_actualizada.id,
            "empresa_id": producto_actualizada.empresa_id,
            "nombre": producto_actualizada.nombre,
            "sku": producto_actualizada.sku,
            "activo": producto_actualizada.activo,
            "unidad_medida_id": producto_actualizada.unidad_medida_id,
            "tipo_producto_id": producto_actualizada.tipo_producto_id,
            "precio_costo": producto_actualizada.precio_costo
        }
    
    async def eliminar_producto(self, producto_id: int, empresa_id: int) -> Dict[str, Any]:
        """
        Elimina una producto.
        
        Args:
            producto_id: ID de el producto
            empresa_id: ID de la empresa (validación multi-tenant)
            
        Returns:
            Dict con confirmación de eliminación
            
        Raises:
            ValueError: Si el producto no existe
        """
        # Validar que el producto existe
        producto = await self.repository.obtener_por_id(producto_id, empresa_id)
        if not producto:
            raise ValueError("Producto no encontrada")
        
        # Eliminar producto
        resultado = await self.repository.eliminar(producto_id, empresa_id)
        
        if not resultado:
            raise ValueError("Error al eliminar el producto")
        
        return {
            "mensaje": f"Producto '{producto.nombre}' eliminada exitosamente",
            "producto_id": producto_id
        }
