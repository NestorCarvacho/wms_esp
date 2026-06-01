"""

Servicio de autenticación y gestión de tokens JWT.

"""

from datetime import datetime

from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession



from app.core.security import create_access_token, verify_password

from app.infrastructure.repositories.usuario_repository import UsuarioRepository

from app.domain.services.autorizacion_service import AutorizacionService

from app.domain.services.display_helpers import format_empresa_nombre

from app.schemas.usuario import UsuarioRespuestaDTO





class AuthService:

    def __init__(self, repository: UsuarioRepository, session: AsyncSession):

        self.repository = repository

        self.session = session

    

    async def login(self, email: str, contrasena: str) -> Dict[str, Any]:

        usuario = await self.repository.obtener_por_email(email)

        if not usuario:

            raise ValueError("Usuario no encontrado")

        

        if not usuario.activo:

            raise ValueError("Usuario inactivo")

        

        if not verify_password(contrasena, usuario.password_hash):

            raise ValueError("Contraseña incorrecta")

        

        usuario.ultimo_login = datetime.utcnow()

        await self.repository.actualizar(usuario)



        autorizacion = AutorizacionService(self.session)

        permisos, roles = await autorizacion.resolver_permisos_por_usuario(

            usuario.id,

            usuario.empresa_id,

        )



        es_empresa_maestra = bool(getattr(usuario.empresa, "es_empresa_maestra", False))

        token_data = {

            "usuario_id": usuario.id,

            "empresa_id": usuario.empresa_id,

            "email": usuario.email,

            "cargo_id": usuario.cargo_id,

            "roles": roles,

            "permisos": permisos,

            "es_empresa_maestra": es_empresa_maestra,

        }

        access_token = create_access_token(data=token_data)

        

        usuario_dto = UsuarioRespuestaDTO.model_validate(usuario)

        usuario_data = usuario_dto.model_dump()

        usuario_data["empresa_nombre"] = format_empresa_nombre(usuario.empresa)

        usuario_data["cargo_nombre"] = usuario.cargo.nombre if usuario.cargo else None

        usuario_data["es_empresa_maestra"] = es_empresa_maestra

        usuario_data["roles"] = roles

        usuario_data["permisos"] = permisos

        

        return {

            "acceso_token": access_token,

            "token_type": "bearer",

            "usuario": usuario_data

        }

    

    async def validar_token(self, payload: Dict[str, Any]) -> bool:

        usuario_id = payload.get("usuario_id")

        empresa_id = payload.get("empresa_id")

        

        if not usuario_id or not empresa_id:

            return False

        

        usuario = await self.repository.obtener_por_id(usuario_id, empresa_id)

        return usuario is not None and usuario.activo


