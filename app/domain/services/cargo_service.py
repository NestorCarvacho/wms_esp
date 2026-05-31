"""
Servicio CRUD de Cargos (Capa de Negocio).
Orquesta la lógica de negocio para operaciones CRUD.
"""
from typing import Dict, Any
from app.infrastructure.repositories.cargo_crud_repository import CargoCRUDRepository
from app.domain.services.display_helpers import format_empresa_nombre


class CargoService:
    """Servicio CRUD de cargos con validaciones de negocio."""
    
    def __init__(self, repository: CargoCRUDRepository):
        self.repository = repository
    
    async def listar_cargos(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        buscar: str | None = None,
    ) -> Dict[str, Any]:
        """
        Lista cargos de una empresa.
        
        Args:
            empresa_id: ID de la empresa
            pagina: Número de página
            por_pagina: Cargos por página
            es_super_admin: Si True, lista cargos de TODAS las empresas
            
        Returns:
            Dict con total, página actual, cargos por página y lista de cargos
        """
        cargos, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            buscar=buscar,
        )
        
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "cargos": [
                {
                    "id": c.id,
                    "nombre": c.nombre,
                    "empresa_id": c.empresa_id,
                    "empresa_nombre": format_empresa_nombre(c.empresa),
                }
                for c in cargos
            ]
        }
    
    async def obtener_cargo(self, cargo_id: int, empresa_id: int = None) -> Dict[str, Any]:
        """
        Obtiene un cargo específico.
        Si empresa_id es None, obtiene sin filtrar por empresa (super admin).
        
        Args:
            cargo_id: ID del cargo
            empresa_id: ID de la empresa (para filtrado multi-tenant)
            
        Raises:
            ValueError: Si el cargo no existe
        """
        cargo = await self.repository.obtener_por_id(cargo_id, empresa_id)
        if not cargo:
            raise ValueError("Cargo no encontrado")
        
        return {
            "id": cargo.id,
            "empresa_id": cargo.empresa_id,
            "nombre": cargo.nombre
        }
    
    async def crear_cargo(
        self,
        empresa_id: int,
        nombre: str
    ) -> Dict[str, Any]:
        """
        Crea un nuevo cargo.
        
        Args:
            empresa_id: ID de la empresa
            nombre: Nombre del cargo
            
        Returns:
            Dict con datos del cargo creado
            
        Raises:
            ValueError: Si el nombre ya existe en la empresa
        """
        # Validar que el nombre no esté vacío
        if not nombre or not nombre.strip():
            raise ValueError("El nombre del cargo no puede estar vacío")
        
        nombre = nombre.strip()
        
        # Validar que el nombre sea único por empresa
        cargo_existente = await self.repository.obtener_por_nombre(nombre, empresa_id)
        if cargo_existente:
            raise ValueError(f"Ya existe un cargo con el nombre '{nombre}' en esta empresa")
        
        # Crear cargo
        nuevo_cargo = await self.repository.crear(empresa_id, nombre)
        
        return {
            "id": nuevo_cargo.id,
            "empresa_id": nuevo_cargo.empresa_id,
            "nombre": nuevo_cargo.nombre
        }
    
    async def actualizar_cargo(
        self,
        cargo_id: int,
        empresa_id: int,
        nombre: str = None
    ) -> Dict[str, Any]:
        """
        Actualiza un cargo existente.
        
        Args:
            cargo_id: ID del cargo
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre del cargo
            
        Returns:
            Dict con datos del cargo actualizado
            
        Raises:
            ValueError: Si el cargo no existe o si el nombre es duplicado
        """
        # Validar que el cargo existe
        cargo_existente = await self.repository.obtener_por_id(cargo_id, empresa_id)
        if not cargo_existente:
            raise ValueError("Cargo no encontrado")
        
        # Si se actualiza el nombre, validar unicidad
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            
            # Verificar que el nuevo nombre no exista (excepto el actual)
            cargo_con_nombre = await self.repository.obtener_por_nombre(nombre, empresa_id)
            if cargo_con_nombre and cargo_con_nombre.id != cargo_id:
                raise ValueError(f"Ya existe un cargo con el nombre '{nombre}' en esta empresa")
        
        # Actualizar cargo
        cargo_actualizado = await self.repository.actualizar(cargo_id, empresa_id, nombre)
        
        if not cargo_actualizado:
            raise ValueError("Error al actualizar el cargo")
        
        return {
            "id": cargo_actualizado.id,
            "empresa_id": cargo_actualizado.empresa_id,
            "nombre": cargo_actualizado.nombre
        }
    
    async def eliminar_cargo(self, cargo_id: int, empresa_id: int) -> Dict[str, Any]:
        """
        Elimina un cargo.
        
        Args:
            cargo_id: ID del cargo
            empresa_id: ID de la empresa (validación multi-tenant)
            
        Returns:
            Dict con confirmación de eliminación
            
        Raises:
            ValueError: Si el cargo no existe
        """
        # Validar que el cargo existe
        cargo = await self.repository.obtener_por_id(cargo_id, empresa_id)
        if not cargo:
            raise ValueError("Cargo no encontrado")
        
        # Eliminar cargo
        resultado = await self.repository.eliminar(cargo_id, empresa_id)
        
        if not resultado:
            raise ValueError("Error al eliminar el cargo")
        
        return {
            "mensaje": f"Cargo '{cargo.nombre}' eliminado exitosamente",
            "cargo_id": cargo_id
        }
