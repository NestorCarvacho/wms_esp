"""
Servicio de autenticación y gestión de tokens JWT.
Alineado con el esquema de base de datos multi-tenant.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, verify_password
from app.infrastructure.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import TokenResponseDTO, UsuarioRespuestaDTO


class AuthService:
    """Servicio de autenticación con soporte multi-tenant."""
    
    def __init__(self, repository: UsuarioRepository):
        """
        Inicializa el servicio de autenticación.
        
        Args:
            repository: UsuarioRepository para acceso a datos
        """
        self.repository = repository
    
    async def login(
                self,
                email: str,
                contrasena: str
            ) -> Dict[str, Any]:
        """
        Autentica un usuario y genera token JWT.
        
        Args:
            email: Email del usuario
            contrasena: Contraseña en texto plano
            empresa_id: ID de la empresa (multi-tenant)
            
        Returns:
            Dict con acceso_token, token_type y datos del usuario
            
        Raises:
            ValueError: Si el usuario no existe, está inactivo o contraseña es incorrecta
        """
        # 1. Buscar usuario por email y empresa (multi-tenant)
        usuario = await self.repository.obtener_por_email(email)
        if not usuario:
            raise ValueError("Usuario no encontrado")
        
        # 2. Validar que el usuario esté activo
        if not usuario.esta_activo:
            raise ValueError("Usuario inactivo")
        
        # 3. Verificar contraseña
        if not verify_password(contrasena, usuario.password_hash):
            raise ValueError("Contraseña incorrecta")
        
        # 4. Actualizar último login
        usuario.ultimo_login = datetime.utcnow()
        await self.repository.actualizar(usuario)
        
        # 5. Generar token JWT con claims de la empresa
        token_data = {
            "usuario_id": usuario.id,
            "empresa_id": usuario.empresa_id,
            "email": usuario.email,
            "cargo_id": usuario.cargo_id
        }
        access_token = create_access_token(data=token_data)
        
        # 6. Construir respuesta con DTO
        usuario_dto = UsuarioRespuestaDTO.from_orm(usuario)
        
        return {
            "acceso_token": access_token,
            "token_type": "bearer",
            "usuario": usuario_dto
        }
    
    async def validar_token(self, payload: Dict[str, Any]) -> bool:
        """
        Valida que un usuario aún exista y esté activo.
        
        Args:
            payload: Payload decodificado del JWT
            
        Returns:
            True si el usuario es válido, False en caso contrario
        """
        usuario_id = payload.get("usuario_id")
        empresa_id = payload.get("empresa_id")
        
        if not usuario_id or not empresa_id:
            return False
        
        usuario = await self.repository.obtener_por_id(usuario_id, empresa_id)
        return usuario is not None and usuario.esta_activo
    
    async def registrar_usuario(
        self,
        email: str,
        contrasena: str,
        nombre_completo: str,
        empresa_id: int,
        rut: str = None,
        cargo_id: int = None
    ) -> Dict[str, Any]:
        """
        Registra un nuevo usuario en la empresa.
        
        Args:
            email: Email del usuario (único por empresa)
            contrasena: Contraseña en texto plano
            nombre_completo: Nombre completo del usuario
            empresa_id: ID de la empresa (multi-tenant)
            rut: RUT del usuario (opcional)
            cargo_id: ID del cargo (opcional)
            
        Returns:
            Dict con datos del usuario creado
            
        Raises:
            ValueError: Si el email ya existe en la empresa
        """
        # 1. Verificar que el email no exista ya
        usuario_existente = await self.repository.obtener_por_email(email, empresa_id)
        if usuario_existente:
            raise ValueError(f"El email {email} ya está registrado en esta empresa")
        
        # 2. Crear usuario
        nuevo_usuario = await self.repository.crear_usuario(
            empresa_id=empresa_id,
            email=email,
            nombre_completo=nombre_completo,
            contrasena=contrasena,
            rut=rut,
            cargo_id=cargo_id
        )
        
        return {
            "usuario_id": nuevo_usuario.id,
            "email": nuevo_usuario.email,
            "nombre_completo": nuevo_usuario.nombre_completo,
            "empresa_id": nuevo_usuario.empresa_id,
            "esta_activo": nuevo_usuario.esta_activo
        }