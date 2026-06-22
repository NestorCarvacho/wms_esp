"""
Repositorio CRUD de Perfil Usuario (Capa de Datos).
Maneja datos personales y de contacto de los usuarios.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.infrastructure.models.usuario import PerfilUsuario
from typing import Optional


class PerfilUsuarioCRUDRepository:
    """Acceso a datos de perfiles de usuarios."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def obtener_por_usuario_id(self, usuario_id: int) -> PerfilUsuario | None:
        """
        Obtiene el perfil de un usuario por su ID.
        
        Args:
            usuario_id: ID del usuario
            
        Returns:
            PerfilUsuario o None si no existe
        """
        try:
            stmt = select(PerfilUsuario).where(PerfilUsuario.usuario_id == usuario_id)
            result = await self.session.execute(stmt)
            return result.scalars().first()
        except SQLAlchemyError as e:
            raise Exception(f"Error al obtener perfil de usuario: {str(e)}")
    
    async def obtener_por_rut(self, rut: str) -> PerfilUsuario | None:
        """
        Obtiene el perfil de un usuario por su RUT.
        
        Args:
            rut: RUT del usuario
            
        Returns:
            PerfilUsuario o None si no existe
        """
        try:
            stmt = select(PerfilUsuario).where(PerfilUsuario.rut == rut)
            result = await self.session.execute(stmt)
            return result.scalars().first()
        except SQLAlchemyError as e:
            raise Exception(f"Error al obtener perfil por RUT: {str(e)}")
    
    async def crear(
        self,
        usuario_id: int,
        rut: Optional[str] = None,
        nombres: Optional[str] = None,
        apellido_paterno: Optional[str] = None,
        apellido_materno: Optional[str] = None,
        fecha_nacimiento: Optional[datetime] = None,
        genero: Optional[str] = None,
        telefono: Optional[str] = None,
        direccion: Optional[str] = None,
        region_id: Optional[int] = None,
        ciudad_id: Optional[int] = None,
        comuna_id: Optional[int] = None,
        pais: Optional[str] = None,
        foto_url: Optional[str] = None,
        biografia: Optional[str] = None
    ) -> PerfilUsuario:
        try:
            nuevo_perfil = PerfilUsuario(
                usuario_id=usuario_id,
                rut=rut,
                nombres=nombres,
                apellido_paterno=apellido_paterno,
                apellido_materno=apellido_materno,
                fecha_nacimiento=fecha_nacimiento,
                genero=genero,
                telefono=telefono,
                direccion=direccion,
                region_id=region_id,
                ciudad_id=ciudad_id,
                comuna_id=comuna_id,
                pais=pais,
                foto_url=foto_url,
                biografia=biografia
            )
            self.session.add(nuevo_perfil)
            await self.session.commit()
            await self.session.refresh(nuevo_perfil)
            return nuevo_perfil
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear perfil de usuario: {str(e)}")
    
    async def actualizar(self, usuario_id: int, **datos) -> PerfilUsuario | None:
        """
        Actualiza el perfil de un usuario.
        
        Args:
            usuario_id: ID del usuario
            **datos: Campos a actualizar
            
        Returns:
            PerfilUsuario actualizado o None si no existe
        """
        try:
            # Validar que el perfil existe
            perfil = await self.obtener_por_usuario_id(usuario_id)
            if not perfil:
                raise ValueError("Perfil de usuario no encontrado")
            
            # Filtrar campos válidos
            campos_validos = {
                "rut", "nombres", "apellido_paterno", "apellido_materno",
                "fecha_nacimiento", "genero", "telefono", "direccion",
                "region_id", "ciudad_id", "comuna_id", "pais", "foto_url", "biografia"
            }
            datos_filtrados = {k: v for k, v in datos.items() if k in campos_validos}
            
            if not datos_filtrados:
                return perfil
            
            # Ejecutar actualización
            stmt = update(PerfilUsuario).where(
                PerfilUsuario.usuario_id == usuario_id
            ).values(**datos_filtrados)
            
            await self.session.execute(stmt)
            await self.session.commit()
            
            # Retornar perfil actualizado
            return await self.obtener_por_usuario_id(usuario_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar perfil de usuario: {str(e)}")
    
    async def eliminar(self, usuario_id: int) -> bool:
        """
        Elimina el perfil de un usuario.
        
        Args:
            usuario_id: ID del usuario
            
        Returns:
            True si se eliminó exitosamente
        """
        try:
            perfil = await self.obtener_por_usuario_id(usuario_id)
            if not perfil:
                raise ValueError("Perfil de usuario no encontrado")
            
            await self.session.delete(perfil)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar perfil de usuario: {str(e)}")
