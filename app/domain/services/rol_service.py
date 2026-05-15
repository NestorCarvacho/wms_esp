"""
Servicio CRUD de Roles (Capa de Negocio).
Orquesta la lógica de negocio para operaciones CRUD.
"""
from typing import Dict, Any
from app.infrastructure.repositories.rol_crud_repository import RolCRUDRepository


class RolService:
    """Servicio CRUD de roles con validaciones de negocio."""
    
    def __init__(self, repository: RolCRUDRepository):
        self.repository = repository
    
    async def listar_roles(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False
    ) -> Dict[str, Any]:

        roles, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin
        )

        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "roles": [
                {
                    "id": r.id,
                    "nombre": r.nombre,
                    "descripcion": r.descripcion,
                    "activo": r.activo,
                    "empresa_id": r.empresa_id,
                    "cargo_id": r.cargo_id,
                    "cargo_nombre": r.cargo.nombre if r.cargo_id else None
                }
                for r in roles
            ]
        }
    
    async def obtener_rol(self, rol_id: int, empresa_id: int = None) -> Dict[str, Any]:
        """
        Obtiene un rol específico.
        Si empresa_id es None, obtiene sin filtrar por empresa (super admin).
        
        Args:
            rol_id: ID del rol
            empresa_id: ID de la empresa (para filtrado multi-tenant)
            
        Raises:
            ValueError: Si el rol no existe
        """
        rol = await self.repository.obtener_por_id(rol_id, empresa_id)
        if not rol:
            raise ValueError("Rol no encontrado")
        
        return {
            "id": rol.id,
            "empresa_id": rol.empresa_id,
            "nombre": rol.nombre
        }
    
    async def crear_rol(
        self,
        empresa_id: int,
        nombre: str,
        cargo_id: int,
        descripcion: str = None,
        activo: bool = True
    ) -> Dict[str, Any]:
        """
        Crea un nuevo rol.
        
        Args:
            empresa_id: ID de la empresa
            nombre: Nombre del rol
            
        Returns:
            Dict con datos del rol creado
            
        Raises:
            ValueError: Si el nombre ya existe en la empresa
        """
        # Validar que el nombre no esté vacío
        if not nombre or not nombre.strip():
            raise ValueError("El nombre del rol no puede estar vacío")
        
        # Validar que el cargo_id no sea nulo
        if cargo_id is None:
            raise ValueError("El cargo_id no puede ser nulo")
        
        # Validar que tenga una descripción
        if not descripcion or not descripcion.strip():
            raise ValueError("La descripción del rol no puede estar vacía")

        nombre = nombre.strip()
        descripcion = descripcion.strip() if descripcion else None
        
        # Validar que el nombre sea único por empresa
        rol_existente = await self.repository.obtener_por_nombre(nombre, empresa_id)
        if rol_existente:
            raise ValueError(f"Ya existe un rol con el nombre '{nombre}' en esta empresa")
        
        # Crear rol
        nuevo_rol = await self.repository.crear(empresa_id, nombre, cargo_id, descripcion, activo)
        
        return {
            "id": nuevo_rol.id,
            "empresa_id": nuevo_rol.empresa_id,
            "nombre": nuevo_rol.nombre
        }
    
    async def actualizar_rol(
        self,
        rol_id: int,
        empresa_id: int,
        nombre: str = None
    ) -> Dict[str, Any]:
        """
        Actualiza un rol existente.
        
        Args:
            rol_id: ID del rol
            empresa_id: ID de la empresa (validación multi-tenant)
            nombre: Nuevo nombre del rol
            
        Returns:
            Dict con datos del rol actualizado
            
        Raises:
            ValueError: Si el rol no existe o si el nombre es duplicado
        """
        # Validar que el rol existe
        rol_existente = await self.repository.obtener_por_id(rol_id, empresa_id)
        if not rol_existente:
            raise ValueError("Rol no encontrado")
        
        # Si se actualiza el nombre, validar unicidad
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            
            # Verificar que el nuevo nombre no exista (excepto el actual)
            rol_con_nombre = await self.repository.obtener_por_nombre(nombre, empresa_id)
            if rol_con_nombre and rol_con_nombre.id != rol_id:
                raise ValueError(f"Ya existe un rol con el nombre '{nombre}' en esta empresa")
        
        # Actualizar rol
        rol_actualizado = await self.repository.actualizar(rol_id, empresa_id, nombre)
        
        if not rol_actualizado:
            raise ValueError("Error al actualizar el rol")
        
        return {
            "id": rol_actualizado.id,
            "empresa_id": rol_actualizado.empresa_id,
            "nombre": rol_actualizado.nombre
        }
    
    async def eliminar_rol(self, rol_id: int, empresa_id: int) -> Dict[str, Any]:
        """
        Elimina un rol.
        
        Args:
            rol_id: ID del rol
            empresa_id: ID de la empresa (validación multi-tenant)
            
        Returns:
            Dict con confirmación de eliminación
            
        Raises:
            ValueError: Si el rol no existe
        """
        # Validar que el rol existe
        rol = await self.repository.obtener_por_id(rol_id, empresa_id)
        if not rol:
            raise ValueError("Rol no encontrado")
        
        # Eliminar rol
        resultado = await self.repository.eliminar(rol_id, empresa_id)
        
        if not resultado:
            raise ValueError("Error al eliminar el rol")
        
        return {
            "mensaje": f"Rol '{rol.nombre}' eliminado exitosamente",
            "rol_id": rol_id
        }
