"""
Servicio CRUD de Usuarios (Capa de Negocio).
Orquesta la lógica de negocio para operaciones CRUD.
"""
from typing import Dict, Any, List, Tuple
from app.infrastructure.repositories.usuario_crud_repository import UsuarioCRUDRepository


class UsuarioService:
    """Servicio CRUD de usuarios con validaciones de negocio."""
    
    def __init__(self, repository: UsuarioCRUDRepository):
        self.repository = repository
    
    async def listar_usuarios(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        es_super_admin: bool = False
    ) -> Dict[str, Any]:
        """
        Lista usuarios de una empresa.
        
        Args:
            empresa_id: ID de la empresa
            pagina: Número de página
            por_pagina: Usuarios por página
            es_super_admin: Si True, lista usuarios de TODAS las empresas
            
        Returns:
            Dict con total, página actual, usuarios por página y lista de usuarios
        """
        usuarios, total = await self.repository.listar(
            empresa_id=empresa_id,
            pagina=pagina,
            por_pagina=por_pagina,
            solo_activos=True,
            es_super_admin=es_super_admin
        )
        
        return {
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "usuarios": [
                {
                    "id": u.id,
                    "email": u.email,
                    "nombre_completo": u.nombre_completo,
                    "rut": u.rut,
                    "cargo_id": u.cargo_id,
                    "esta_activo": u.esta_activo,
                    "ultimo_login": u.ultimo_login,
                    "fecha_creacion": u.fecha_creacion,
                    "empresa_id": u.empresa_id
                }
                for u in usuarios
            ]
        }
    
    async def obtener_usuario(self, usuario_id: int, empresa_id: int = None) -> Dict[str, Any]:
        """
        Obtiene un usuario específico.
        Si empresa_id es None, obtiene sin filtrar por empresa (super admin).
        
        Raises:
            ValueError: Si el usuario no existe
        """
        usuario = await self.repository.obtener_por_id(usuario_id, empresa_id)
        if not usuario:
            raise ValueError("Usuario no encontrado")
        
        return {
            "id": usuario.id,
            "empresa_id": usuario.empresa_id,
            "email": usuario.email,
            "nombre_completo": usuario.nombre_completo,
            "rut": usuario.rut,
            "cargo_id": usuario.cargo_id,
            "esta_activo": usuario.esta_activo,
            "ultimo_login": usuario.ultimo_login,
            "fecha_creacion": usuario.fecha_creacion
        }
    
    async def crear_usuario(
        self,
        empresa_id: int,
        email: str,
        nombre_completo: str,
        contrasena: str,
        rut: str = None,
        cargo_id: int = None
    ) -> Dict[str, Any]:
        """
        Crea un nuevo usuario.
        
        Validaciones:
        - Email único por empresa
        - Contraseña fuerte (delegado a Pydantic)
        
        Raises:
            ValueError: Si el email ya existe
        """
        # Verificar que el email no exista en la empresa
        usuario_existente = await self.repository.obtener_por_email(email, empresa_id)
        if usuario_existente:
            raise ValueError(f"El email {email} ya está registrado en esta empresa")
        
        nuevo_usuario = await self.repository.crear(
            empresa_id=empresa_id,
            email=email,
            nombre_completo=nombre_completo,
            contrasena=contrasena,
            rut=rut,
            cargo_id=cargo_id
        )
        
        return {
            "id": nuevo_usuario.id,
            "empresa_id": nuevo_usuario.empresa_id,
            "email": nuevo_usuario.email,
            "nombre_completo": nuevo_usuario.nombre_completo,
            "rut": nuevo_usuario.rut,
            "cargo_id": nuevo_usuario.cargo_id,
            "esta_activo": nuevo_usuario.esta_activo,
            "fecha_creacion": nuevo_usuario.fecha_creacion
        }
    
    async def actualizar_usuario(
        self,
        usuario_id: int,
        empresa_id: int,
        nombre_completo: str = None,
        rut: str = None,
        cargo_id: int = None,
        contrasena: str = None
    ) -> Dict[str, Any]:
        """
        Actualiza un usuario existente.
        
        Raises:
            ValueError: Si el usuario no existe
        """
        datos_actualizacion = {
            "nombre_completo": nombre_completo,
            "rut": rut,
            "cargo_id": cargo_id,
            "contrasena": contrasena
        }
        
        usuario_actualizado = await self.repository.actualizar(
            usuario_id=usuario_id,
            empresa_id=empresa_id,
            **datos_actualizacion
        )
        
        if not usuario_actualizado:
            raise ValueError("Usuario no encontrado")
        
        return {
            "id": usuario_actualizado.id,
            "empresa_id": usuario_actualizado.empresa_id,
            "email": usuario_actualizado.email,
            "nombre_completo": usuario_actualizado.nombre_completo,
            "rut": usuario_actualizado.rut,
            "cargo_id": usuario_actualizado.cargo_id,
            "esta_activo": usuario_actualizado.esta_activo,
            "fecha_creacion": usuario_actualizado.fecha_creacion
        }
    
    async def eliminar_usuario(self, usuario_id: int, empresa_id: int) -> Dict[str, Any]:
        """
        Elimina (desactiva) un usuario.
        
        Raises:
            ValueError: Si el usuario no existe
        """
        resultado = await self.repository.eliminar(usuario_id, empresa_id)
        
        if not resultado:
            raise ValueError("Usuario no encontrado")
        
        return {
            "id": usuario_id,
            "mensaje": "Usuario desactivado correctamente"
        }
    
    async def reactivar_usuario(self, usuario_id: int, empresa_id: int) -> Dict[str, Any]:
        """
        Reactiva un usuario desactivado.
        
        Raises:
            ValueError: Si el usuario no existe
        """
        usuario_reactivado = await self.repository.reactivar(usuario_id, empresa_id)
        
        if not usuario_reactivado:
            raise ValueError("Usuario no encontrado")
        
        return {
            "id": usuario_reactivado.id,
            "email": usuario_reactivado.email,
            "nombre_completo": usuario_reactivado.nombre_completo,
            "esta_activo": usuario_reactivado.esta_activo,
            "mensaje": "Usuario reactivado correctamente"
        }
