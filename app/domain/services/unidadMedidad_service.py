"""
Servicio CRUD de Productos (Capa de Negocio).
Orquesta la lógica de negocio para operaciones CRUD.
"""
from typing import Dict, Any
from app.infrastructure.repositories.unidadMedida_crud_repository import UnidadMedidaCRUDRepository
from app.domain.services.display_helpers import format_empresa_nombre


class UnidadMedidaService:
    """Servicio CRUD de unidades de medida con validaciones de negocio."""
    
    def __init__(self, repository: UnidadMedidaCRUDRepository):
        self.repository = repository
    
    async def listar_unidades_medida(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        buscar: str | None = None,
    ) -> Dict[str, Any]:
        """
        Lista unidades de medida de una empresa.
        
        Args:
            empresa_id: ID de la empresa
            pagina: Número de página
            por_pagina: Unidades de medida por página
            es_super_admin: Si True, lista unidades de medida de TODAS las empresas
            
        Returns:
            Dict con total, página actual, unidades de medida por página y lista de unidades de medida
        """
        unidades_medida, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            buscar=buscar,
        )
        
                # "empresa_id": 1,
                # "nombre": "Kilogramo",
                # "codigo": "KG",
                # "activo": 1

        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "productos": [
                {
                    "id": b.id,
                    "empresa_id": b.empresa_id,
                    "empresa_nombre": format_empresa_nombre(b.empresa),
                    "nombre": b.nombre,
                    "codigo": b.codigo,
                    "activo": b.activo
                }
                for b in unidades_medida
            ]
        }
    
    async def obtener_unidad_medida(self, unidad_medida_id: int, empresa_id: int = None) -> Dict[str, Any]:
        """
        Obtiene una producto específica.
        Si empresa_id es None, obtiene sin filtrar por empresa (super admin).
        
        Args:
            producto_id: ID de el producto
            empresa_id: ID de la empresa (para filtrado multi-tenant)
            
        Raises:
            ValueError: Si el producto no existe
        """
        unidad_medida = await self.repository.obtener_por_id(unidad_medida_id, empresa_id)
        if not unidad_medida:
            raise ValueError("Unidad de medida no encontrada")
        
        return {
            "id": unidad_medida.id,
            "empresa_id": unidad_medida.empresa_id,
            "nombre": unidad_medida.nombre,
            "codigo": unidad_medida.codigo
        }
    
    async def crear_unidad_medida(
        self,
        empresa_id: int,
        nombre: str,
        codigo: str,
        activo: bool = True
    ) -> Dict[str, Any]:
        """
        Crea una nueva unidad de medida.
        
        Args:
            empresa_id: ID de la empresa
            nombre: Nombre de la unidad de medida
            codigo: Código de la unidad de medida
            activo: Estado de la unidad de medida
        Returns:
            Dict con datos de la unidad de medida creada
            
        Raises:
            ValueError: Si el nombre ya existe en la empresa
        """
        # Validar que el nombre no esté vacío
        if not nombre or not nombre.strip():
            raise ValueError("El nombre de la unidad de medida no puede estar vacío")
        
        #validar que el el código no esté vacío
        if not codigo or not codigo.strip():
            raise ValueError("El código de la unidad de medida no puede estar vacío")

        nombre = nombre.strip()
        codigo = codigo.strip()
        
        # Validar que el nombre sea único por empresa
        unidad_medida_existente = await self.repository.obtener_por_nombre(nombre, empresa_id)
        if unidad_medida_existente:
            raise ValueError(f"Ya existe una unidad de medida con el nombre '{nombre}' en esta empresa")
        
        # Crear unidad de medida
        nueva_unidad_medida = await self.repository.crear(empresa_id, nombre, codigo, activo)
        
        return {
            "id": nueva_unidad_medida.id,
            "empresa_id": nueva_unidad_medida.empresa_id,
            "nombre": nueva_unidad_medida.nombre,
            "codigo": nueva_unidad_medida.codigo,
            "activo": nueva_unidad_medida.activo   
        }
    
    async def actualizar_unidad_medida(
        self,
        unidad_medida_id: int,
        empresa_id: int,
        nombre: str = None,
        codigo: str = None,
        activo: int = None
    ) -> Dict[str, Any]:
        """
        Actualiza una unidad de medida existente.
        
        Args:
            unidad_medida_id: ID de la unidad de medida
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre de la unidad de medida
            codigo: Nuevo código de la unidad de medida
            activo: Nuevo estado de la unidad de medida (1 o 0)
            
        Returns:
            Dict con datos de la unidad de medida actualizada
            
        Raises:
            ValueError: Si la unidad de medida no existe o si el nombre es duplicado
        """
        # Validar que la unidad de medida existe
        unidad_medida_existente = await self.repository.obtener_por_id(unidad_medida_id, empresa_id)
        if not unidad_medida_existente:
            raise ValueError("Unidad de medida no encontrada")
        
        # Validar que la ell sku de el producto no exista
        if codigo is not None and codigo.strip():
            codigo = codigo.strip()
            
            # Verificar que el nuevo código no exista (excepto el actual)
            unidad_medida_con_codigo = await self.repository.obtener_por_codigo(codigo, empresa_id)
            if unidad_medida_con_codigo and unidad_medida_con_codigo.id != unidad_medida_id:
                raise ValueError(f"Ya existe una unidad de medida con el código '{codigo}' en esta empresa")
        
        # Si se actualiza el nombre, validar unicidad
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            
            # Verificar que el nuevo nombre no exista (excepto el actual)
            unidad_medida_con_nombre = await self.repository.obtener_por_nombre(nombre, empresa_id)
            if unidad_medida_con_nombre and unidad_medida_con_nombre.id != unidad_medida_id:
                raise ValueError(f"Ya existe una unidad de medida con el nombre '{nombre}' en esta empresa")
        
        # Actualizar unidad de medida
        unidad_medida_actualizada = await self.repository.actualizar(unidad_medida_id, empresa_id, nombre, codigo, activo)

        if not unidad_medida_actualizada:
            raise ValueError("Error al actualizar la unidad de medida")
        
        return {
            "id": unidad_medida_actualizada.id,
            "empresa_id": unidad_medida_actualizada.empresa_id,
            "nombre": unidad_medida_actualizada.nombre,
            "codigo": unidad_medida_actualizada.codigo,
            "activo": unidad_medida_actualizada.activo
        }
    
    async def eliminar_unidad_medida(self, unidad_medida_id: int, empresa_id: int) -> Dict[str, Any]:
        """
        Elimina una unidad de medida.
        
        Args:
            unidad_medida_id: ID de la unidad de medida
            empresa_id: ID de la empresa (validación multi-tenant)
            
        Returns:
            Dict con confirmación de eliminación
            
        Raises:
            ValueError: Si la unidad de medida no existe
        """
        # Validar que la unidad de medida existe
        unidad_medida = await self.repository.obtener_por_id(unidad_medida_id, empresa_id)
        if not unidad_medida:
            raise ValueError("Unidad de medida no encontrada")
        
        # Eliminar unidad de medida
        resultado = await self.repository.eliminar(unidad_medida_id, empresa_id)
        
        if not resultado:
            raise ValueError("Error al eliminar la unidad de medida")
        
        return {
            "mensaje": f"Unidad de medida '{unidad_medida.nombre}' eliminada exitosamente",
            "unidad_medida_id": unidad_medida_id
        }
