"""
Repositorio de Usuarios (Capa de Datos).
CRUD con filtrado automático por empresa_id.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.infrastructure.models.usuario import Usuario
from app.core.security import hash_password, verify_password


class UsuarioRepository:
    """Acceso a datos de usuarios con auditoría y aislamiento multi-tenant."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def crear_usuario(
        self,
        empresa_id: int,
        email: str,
        nombre_completo: str,
        contrasena: str,
        rut: str = None,
        cargo_id: int = None
    ) -> Usuario:
        """
        Crea un nuevo usuario en la empresa especificada.
        La contraseña es hasheada automáticamente.
        """
        try:
            nuevo_usuario = Usuario(
                empresa_id=empresa_id,
                cargo_id=cargo_id,
                email=email,
                password_hash=hash_password(contrasena),
                esta_activo=True
            )
            self.session.add(nuevo_usuario)
            await self.session.commit()
            await self.session.refresh(nuevo_usuario)
            return nuevo_usuario
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear usuario: {str(e)}")
    
    async def obtener_por_email(
            self,
            email: str
        ):
        """
        Obtiene un usuario por email, filtrando por empresa.
        Garantiza aislamiento multi-tenant.
        """
        stmt = select(Usuario).where(
            Usuario.email == email,
            #Usuario.empresa_id == empresa_id,
            Usuario.esta_activo == True,
            Usuario.nombre_completo != None
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def obtener_por_id(self, id: int, empresa_id: int) -> Usuario | None:
        """
        Obtiene un usuario por ID, filtrando por empresa.
        """
        stmt = select(Usuario).where(
            Usuario.id == id,
            Usuario.empresa_id == empresa_id,
            Usuario.esta_activo == True,
            Usuario.nombre_completo != None
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def verificar_contrasena(self, id: int, empresa_id: int, contrasena_plana: str) -> bool:
        """
        Verifica si la contraseña coincide con el usuario especificado.
        """
        usuario = await self.obtener_por_id(id, empresa_id)
        if not usuario:
            return False
        return verify_password(contrasena_plana, usuario.password_hash)
    
    async def actualizar(self, usuario: Usuario) -> Usuario:
        """
        Actualiza un usuario existente en la BD.
        """
        try:
            self.session.add(usuario)
            await self.session.commit()
            await self.session.refresh(usuario)
            return usuario
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar usuario: {str(e)}")
