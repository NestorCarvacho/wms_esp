"""
Servicio CRUD de Roles (Capa de Negocio).
"""
from typing import Dict, Any
from app.infrastructure.repositories.rol_crud_repository import RolCRUDRepository
from app.domain.services.display_helpers import format_empresa_nombre


class RolService:
    def __init__(self, repository: RolCRUDRepository):
        self.repository = repository
    
    async def listar_roles(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False,
        empresa_id_filtro: int | None = None,
        buscar: str | None = None,
    ) -> Dict[str, Any]:
        roles, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            es_super_admin=es_super_admin,
            empresa_id_filtro=empresa_id_filtro,
            buscar=buscar,
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
                    "empresa_nombre": format_empresa_nombre(r.empresa),
                }
                for r in roles
            ]
        }
    
    async def obtener_rol(self, rol_id: int, empresa_id: int = None) -> Dict[str, Any]:
        rol = await self.repository.obtener_por_id(rol_id, empresa_id)
        if not rol:
            raise ValueError("Rol no encontrado")
        
        return {
            "id": rol.id,
            "empresa_id": rol.empresa_id,
            "nombre": rol.nombre,
            "descripcion": rol.descripcion,
            "activo": rol.activo,
        }
    
    async def crear_rol(
        self,
        empresa_id: int,
        nombre: str,
        descripcion: str = None,
        activo: bool = True,
    ) -> Dict[str, Any]:
        if not nombre or not nombre.strip():
            raise ValueError("El nombre del rol no puede estar vacío")
        if not descripcion or not descripcion.strip():
            raise ValueError("La descripción del rol no puede estar vacía")

        nombre = nombre.strip()
        descripcion = descripcion.strip()
        
        rol_existente = await self.repository.obtener_por_nombre(nombre, empresa_id)
        if rol_existente:
            raise ValueError(f"Ya existe un rol con el nombre '{nombre}' en esta empresa")
        
        nuevo_rol = await self.repository.crear(empresa_id, nombre, descripcion, activo)
        
        return {
            "id": nuevo_rol.id,
            "empresa_id": nuevo_rol.empresa_id,
            "nombre": nuevo_rol.nombre,
            "descripcion": nuevo_rol.descripcion,
        }
    
    async def actualizar_rol(
        self,
        rol_id: int,
        empresa_id: int,
        nombre: str = None,
        descripcion: str = None,
        activo: bool = None,
    ) -> Dict[str, Any]:
        rol_existente = await self.repository.obtener_por_id(rol_id, empresa_id)
        if not rol_existente:
            raise ValueError("Rol no encontrado")
        
        if nombre is not None and nombre.strip():
            nombre = nombre.strip()
            rol_con_nombre = await self.repository.obtener_por_nombre(nombre, empresa_id)
            if rol_con_nombre and rol_con_nombre.id != rol_id:
                raise ValueError(f"Ya existe un rol con el nombre '{nombre}' en esta empresa")
        
        rol_actualizado = await self.repository.actualizar(
            rol_id, empresa_id, nombre, descripcion, activo
        )
        
        if not rol_actualizado:
            raise ValueError("Error al actualizar el rol")
        
        return {
            "id": rol_actualizado.id,
            "empresa_id": rol_actualizado.empresa_id,
            "nombre": rol_actualizado.nombre,
            "descripcion": rol_actualizado.descripcion,
            "activo": rol_actualizado.activo,
        }
    
    async def eliminar_rol(self, rol_id: int, empresa_id: int) -> Dict[str, Any]:
        rol = await self.repository.obtener_por_id(rol_id, empresa_id)
        if not rol:
            raise ValueError("Rol no encontrado")
        
        resultado = await self.repository.eliminar(rol_id, empresa_id)
        if not resultado:
            raise ValueError("Error al eliminar el rol")
        
        return {
            "mensaje": f"Rol '{rol.nombre}' eliminado exitosamente",
            "rol_id": rol_id
        }
