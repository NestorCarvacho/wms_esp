"""
Servicio CRUD de Bodegas (Capa de Negocio).
Orquesta la lógica de negocio para operaciones CRUD.
"""
from typing import Dict, Any
from app.infrastructure.repositories.bodega_crud_repository import BodegaCRUDRepository
from app.domain.services.display_helpers import format_empresa_nombre


class BodegaService:
    """Servicio CRUD de bodegas con validaciones de negocio."""
    
    def __init__(self, repository: BodegaCRUDRepository):
        self.repository = repository
    
    async def listar_bodegas(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        empresas_scope_ids: list[int] | None = None,
        buscar: str | None = None,
        ordenar_por: str | None = None,
        orden: str | None = None,
    ) -> Dict[str, Any]:
        """
        Lista bodegas de una empresa.
        
        Args:
            empresa_id: ID de la empresa
            pagina: Número de página
            por_pagina: Bodegas por página
            es_super_admin: Si True, lista bodegas de TODAS las empresas
            
        Returns:
            Dict con total, página actual, bodegas por página y lista de bodegas
        """
        bodegas, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            empresa_id_filtro=empresa_id_filtro,
            empresas_scope_ids=empresas_scope_ids,
            buscar=buscar,
            ordenar_por=ordenar_por,
            orden=orden,
        )
        
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "bodegas": [
                {
                    "id": b.id,
                    "nombre": b.nombre,
                    "empresa_id": b.empresa_id,
                    "empresa_nombre": format_empresa_nombre(b.empresa),
                    "codigo": b.codigo,
                    "activo": b.activo
                }
                for b in bodegas
            ]
        }
    
    async def obtener_bodega(self, bodega_id: int, empresa_id: int = None) -> Dict[str, Any]:
        """
        Obtiene una bodega específica.
        Si empresa_id es None, obtiene sin filtrar por empresa (super admin).
        
        Args:
            bodega_id: ID de la bodega
            empresa_id: ID de la empresa (para filtrado multi-tenant)
            
        Raises:
            ValueError: Si la bodega no existe
        """
        bodega = await self.repository.obtener_por_id(bodega_id, empresa_id)
        if not bodega:
            raise ValueError("Bodega no encontrada")
        
        return {
            "id": bodega.id,
            "empresa_id": bodega.empresa_id,
            "nombre": bodega.nombre,
            "codigo": bodega.codigo
        }
    
    async def crear_bodega(
        self,
        empresa_id: int,
        nombre: str,
        codigo: str,
        activo: bool = True
    ) -> Dict[str, Any]:
        """
        Crea una nueva bodega.
        
        Args:
            empresa_id: ID de la empresa
            nombre: Nombre de la bodega
            codigo: Código de la bodega
            activo: Estado de la bodega
        Returns:
            Dict con datos de la bodega creada
            
        Raises:
            ValueError: Si el nombre ya existe en la empresa
        """
        # Validar que el nombre no esté vacío
        if not nombre or not nombre.strip():
            raise ValueError("El nombre de la bodega no puede estar vacío")
        
        #validar que el el codigo no esté vacío
        if not codigo or not codigo.strip():
            raise ValueError("El código de la bodega no puede estar vacío")

        nombre = nombre.strip()
        codigo = codigo.strip()
        
        # Validar que el nombre sea único por empresa
        bodega_existente = await self.repository.obtener_por_nombre(nombre, empresa_id)
        if bodega_existente:
            raise ValueError(f"Ya existe una bodega con el nombre '{nombre}' en esta empresa")
        
        # Crear bodega
        nueva_bodega = await self.repository.crear(empresa_id, nombre, codigo, activo)
        
        return {
            "id": nueva_bodega.id,
            "empresa_id": nueva_bodega.empresa_id,
            "nombre": nueva_bodega.nombre,
            "codigo": nueva_bodega.codigo,
            "activo": nueva_bodega.activo   
        }
    
    async def actualizar_bodega(
        self,
        bodega_id: int,
        empresa_id: int,
        nombre: str = None,
        codigo: str = None,
        activo: bool | None = None,
    ) -> Dict[str, Any]:
        """
        Actualiza una bodega existente.
        
        Args:
            bodega_id: ID de la bodega
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre de la bodega
            codigo: Nuevo código de la bodega
            
        Returns:
            Dict con datos de la bodega actualizada
            
        Raises:
            ValueError: Si la bodega no existe o si el nombre es duplicado
        """
        # Validar que la bodega existe
        bodega_existente = await self.repository.obtener_por_id(bodega_id, empresa_id)
        if not bodega_existente:
            raise ValueError("Bodega no encontrada")
        
        # Validar que la ell codigo de la bodega no exista
        if codigo is not None and codigo.strip():
            codigo = codigo.strip()
            
            # Verificar que el nuevo código no exista (excepto el actual)
            bodega_con_codigo = await self.repository.obtener_por_codigo(codigo, empresa_id)
            if bodega_con_codigo and bodega_con_codigo.id != bodega_id:
                raise ValueError(f"Ya existe una bodega con el código '{codigo}' en esta empresa")
        
        # Si se actualiza el nombre, validar unicidad
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            
            # Verificar que el nuevo nombre no exista (excepto el actual)
            bodega_con_nombre = await self.repository.obtener_por_nombre(nombre, empresa_id)
            if bodega_con_nombre and bodega_con_nombre.id != bodega_id:
                raise ValueError(f"Ya existe una bodega con el nombre '{nombre}' en esta empresa")
        
        # Actualizar bodega (preservar activo si no se envía)
        activo_efectivo = bodega_existente.activo if activo is None else activo
        bodega_actualizada = await self.repository.actualizar(
            bodega_id, empresa_id, nombre, codigo, activo_efectivo
        )

        if not bodega_actualizada:
            raise ValueError("Error al actualizar la bodega")
        
        return {
            "id": bodega_actualizada.id,
            "empresa_id": bodega_actualizada.empresa_id,
            "nombre": bodega_actualizada.nombre,
            "codigo": bodega_actualizada.codigo,
            "activo": bodega_actualizada.activo,
        }
    
    async def eliminar_bodega(self, bodega_id: int, empresa_id: int) -> Dict[str, Any]:
        """
        Elimina una bodega.
        
        Args:
            bodega_id: ID de la bodega
            empresa_id: ID de la empresa (validación multi-tenant)
            
        Returns:
            Dict con confirmación de eliminación
            
        Raises:
            ValueError: Si la bodega no existe
        """
        # Validar que la bodega existe
        bodega = await self.repository.obtener_por_id(bodega_id, empresa_id)
        if not bodega:
            raise ValueError("Bodega no encontrada")
        
        # Eliminar bodega
        resultado = await self.repository.eliminar(bodega_id, empresa_id)
        
        if not resultado:
            raise ValueError("Error al eliminar la bodega")
        
        return {
            "mensaje": f"Bodega '{bodega.nombre}' eliminada exitosamente",
            "bodega_id": bodega_id
        }
