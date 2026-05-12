"""
Repositorio CRUD de Usuarios (Capa de Datos).
CRUD con filtrado automático por empresa_id.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.infrastructure.models.usuario import Usuario
from app.core.security import hash_password


class UsuarioCRUDRepository:
    """Acceso a datos de usuarios con auditoría y aislamiento multi-tenant."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def listar(
        self,
        empresa_id: int,
        pagina: int = 1,
        por_pagina: int = 10,
        solo_activos: bool = True,
        es_super_admin: bool = False
    ) -> tuple[list[Usuario], int]:
        """
        Lista usuarios de una empresa con paginación.
        
        Args:
            empresa_id: ID de la empresa (multi-tenant)
            pagina: Número de página (desde 1)
            por_pagina: Usuarios por página
            solo_activos: Si True, solo devuelve usuarios activos
            es_super_admin: Si True, lista TODOS los usuarios de todas las empresas
            
        Returns:
            Tupla (lista_usuarios, total_usuarios)
        """
        try:
            # Construir statement base
            stmt_base = select(Usuario)
            
            # Agregar filtro de empresa si no es super admin
            if not es_super_admin:
                stmt_base = stmt_base.where(Usuario.empresa_id == empresa_id)
            
            # Agregar filtro de activos si es necesario
            if solo_activos:
                stmt_base = stmt_base.where(Usuario.esta_activo == True)
            
            # Contar total
            result_count = await self.session.execute(stmt_base)
            total = len(result_count.scalars().all())
            
            # Listar con paginación
            offset = (pagina - 1) * por_pagina
            stmt = stmt_base.offset(offset).limit(por_pagina)
            
            result = await self.session.execute(stmt)
            usuarios = result.scalars().all()
            return usuarios, total
        except SQLAlchemyError as e:
            raise Exception(f"Error al listar usuarios: {str(e)}")
    
    async def obtener_por_id(self, id: int, empresa_id: int = None) -> Usuario | None:
        """
        Obtiene un usuario por ID, filtrando por empresa.
        Si empresa_id es None, obtiene el usuario sin filtrar por empresa (super admin).
        """
        stmt = select(Usuario).where(Usuario.id == id)
        
        # Agregar filtro de empresa si se proporciona
        if empresa_id is not None:
            stmt = stmt.where(Usuario.empresa_id == empresa_id)
        
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def obtener_por_email(self, email: str, empresa_id: int) -> Usuario | None:
        """
        Obtiene un usuario por email, filtrando por empresa.
        """
        stmt = select(Usuario).where(
            Usuario.email == email,
            Usuario.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def crear(
        self,
        empresa_id: int,
        email: str,
        nombre_completo: str,
        contrasena: str,
        rut: str = None,
        cargo_id: int = None
    ) -> Usuario:
        """
        Crea un nuevo usuario.
        """
        try:
            nuevo_usuario = Usuario(
                empresa_id=empresa_id,
                email=email,
                nombre_completo=nombre_completo,
                password_hash=hash_password(contrasena),
                rut=rut,
                cargo_id=cargo_id,
                esta_activo=True
            )
            self.session.add(nuevo_usuario)
            await self.session.commit()
            await self.session.refresh(nuevo_usuario)
            return nuevo_usuario
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al crear usuario: {str(e)}")
    
    async def actualizar(self, usuario_id: int, empresa_id: int, **datos) -> Usuario | None:
        """
        Actualiza un usuario existente.
        
        Args:
            usuario_id: ID del usuario
            empresa_id: ID de la empresa (validación multi-tenant)
            **datos: Campos a actualizar (nombre_completo, rut, cargo_id, contrasena)
        """
        try:
            # Validar que el usuario existe y pertenece a la empresa
            usuario = await self.obtener_por_id(usuario_id, empresa_id)
            if not usuario:
                raise ValueError("Usuario no encontrado")
            
            # Actualizar contraseña si se proporciona
            if "contrasena" in datos and datos["contrasena"]:
                datos["password_hash"] = hash_password(datos.pop("contrasena"))
            else:
                datos.pop("contrasena", None)
            
            # Filtrar campos válidos
            campos_validos = {"nombre_completo", "rut", "cargo_id", "password_hash"}
            datos_filtrados = {k: v for k, v in datos.items() if k in campos_validos and v is not None}
            
            if not datos_filtrados:
                return usuario
            
            # Ejecutar actualización
            stmt = update(Usuario).where(
                and_(Usuario.id == usuario_id, Usuario.empresa_id == empresa_id)
            ).values(**datos_filtrados)
            
            await self.session.execute(stmt)
            await self.session.commit()
            
            # Retornar usuario actualizado
            return await self.obtener_por_id(usuario_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al actualizar usuario: {str(e)}")
    
    async def eliminar(self, usuario_id: int, empresa_id: int) -> bool:
        """
        Elimina (desactiva) un usuario.
        """
        try:
            usuario = await self.obtener_por_id(usuario_id, empresa_id)
            if not usuario:
                raise ValueError("Usuario no encontrado")
            
            stmt = update(Usuario).where(
                and_(Usuario.id == usuario_id, Usuario.empresa_id == empresa_id)
            ).values(esta_activo=False)
            
            await self.session.execute(stmt)
            await self.session.commit()
            return True
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al eliminar usuario: {str(e)}")
    
    async def reactivar(self, usuario_id: int, empresa_id: int) -> Usuario | None:
        """
        Reactiva un usuario desactivado.
        """
        try:
            stmt = update(Usuario).where(
                and_(Usuario.id == usuario_id, Usuario.empresa_id == empresa_id)
            ).values(esta_activo=True)
            
            await self.session.execute(stmt)
            await self.session.commit()
            
            return await self.obtener_por_id(usuario_id, empresa_id)
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise Exception(f"Error al reactivar usuario: {str(e)}")
