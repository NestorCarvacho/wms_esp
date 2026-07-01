"""Servicio de autenticación, bloqueo por intentos y recuperación de contraseña."""
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import (
    LOGIN_LOCKOUT_MINUTES,
    LOGIN_MAX_ATTEMPTS,
    PASSWORD_RESET_COOLDOWN_MINUTES,
    PASSWORD_RESET_EXPIRE_MINUTES,
)
from app.core.security import create_access_token, hash_password, verify_password
from app.domain.services.autorizacion_service import AutorizacionService
from app.domain.services.display_helpers import format_empresa_nombre
from app.infrastructure.email.resend_service import send_password_reset_email
from app.infrastructure.repositories.password_reset_repository import PasswordResetRepository
from app.infrastructure.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import UsuarioRespuestaDTO

MSG_CREDENCIALES = "Email o contraseña incorrectos"
MSG_BLOQUEO_PERMANENTE = (
    "Cuenta bloqueada por seguridad. Comuníquese con el administrador de su empresa."
)


def _resolver_preferencias_locale(usuario) -> dict[str, str]:
    empresa = usuario.empresa
    perfil = usuario.perfil
    locale = (
        perfil.locale_override
        if perfil and perfil.locale_override
        else getattr(empresa, "locale", None) or "es-CL"
    )
    timezone = (
        perfil.timezone_override
        if perfil and perfil.timezone_override
        else getattr(empresa, "timezone", None) or "America/Santiago"
    )
    currency = getattr(empresa, "moneda_codigo", None) or "CLP"
    return {
        "locale": locale,
        "timezone": timezone,
        "currency": currency,
    }


class AuthService:
    def __init__(self, repository: UsuarioRepository, session: AsyncSession):
        self.repository = repository
        self.session = session
        self.reset_repository = PasswordResetRepository(session)

    def _hash_token(self, raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    async def _emitir_sesion(self, usuario) -> dict[str, Any]:
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
        usuario_data["preferencias_locale"] = _resolver_preferencias_locale(usuario)
        return {
            "acceso_token": access_token,
            "token_type": "bearer",
            "usuario": usuario_data,
        }

    async def _validar_estado_login(self, usuario) -> None:
        if usuario.bloqueado_permanente:
            raise ValueError(MSG_BLOQUEO_PERMANENTE)
        if not usuario.activo:
            raise ValueError(MSG_BLOQUEO_PERMANENTE)

        empresa = usuario.empresa
        if empresa and not bool(getattr(empresa, "es_empresa_maestra", False)):
            if not empresa.esta_activa or not empresa.activo:
                raise ValueError(
                    "La empresa está inhabilitada. Comuníquese con el administrador del sistema."
                )

        now = datetime.utcnow()
        if usuario.bloqueado_hasta and usuario.bloqueado_hasta > now:
            minutos = max(
                1,
                int((usuario.bloqueado_hasta - now).total_seconds() // 60) + 1,
            )
            raise ValueError(
                f"Cuenta bloqueada temporalmente. Intente nuevamente en {minutos} minuto(s)."
            )
        if usuario.bloqueado_hasta and usuario.bloqueado_hasta <= now:
            usuario.bloqueado_hasta = None

    async def _registrar_fallo_login(self, usuario) -> None:
        usuario.intentos_fallidos = (usuario.intentos_fallidos or 0) + 1
        if usuario.intentos_fallidos < LOGIN_MAX_ATTEMPTS:
            await self.repository.actualizar(usuario)
            raise ValueError(MSG_CREDENCIALES)

        usuario.intentos_fallidos = 0
        usuario.bloqueos_temporales = (usuario.bloqueos_temporales or 0) + 1
        if usuario.bloqueos_temporales >= 2:
            usuario.bloqueado_permanente = True
            usuario.activo = False
            usuario.bloqueado_hasta = None
            await self.repository.actualizar(usuario)
            raise ValueError(MSG_BLOQUEO_PERMANENTE)

        usuario.bloqueado_hasta = datetime.utcnow() + timedelta(minutes=LOGIN_LOCKOUT_MINUTES)
        await self.repository.actualizar(usuario)
        raise ValueError(
            f"Demasiados intentos fallidos. Cuenta bloqueada por {LOGIN_LOCKOUT_MINUTES} minutos."
        )

    async def login(self, email: str, contrasena: str) -> dict[str, Any]:
        usuario = await self.repository.obtener_por_email_login(email)
        if not usuario:
            raise ValueError(MSG_CREDENCIALES)

        await self._validar_estado_login(usuario)

        if not verify_password(contrasena, usuario.password_hash):
            await self._registrar_fallo_login(usuario)

        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        usuario.ultimo_login = datetime.utcnow()
        await self.repository.actualizar(usuario)
        return await self._emitir_sesion(usuario)

    async def solicitar_recuperacion(self, email: str) -> None:
        usuario = await self.repository.obtener_por_email_login(email)
        if not usuario or usuario.bloqueado_permanente or not usuario.activo:
            return

        if await self.reset_repository.hay_solicitud_reciente(
            usuario.id, PASSWORD_RESET_COOLDOWN_MINUTES
        ):
            return

        raw_token = secrets.token_urlsafe(32)
        expira_at = datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_EXPIRE_MINUTES)
        await self.reset_repository.crear(usuario.id, self._hash_token(raw_token), expira_at)
        try:
            await send_password_reset_email(usuario.email, raw_token)
            await self.session.commit()
        except Exception:
            await self.session.rollback()
            raise

    async def restablecer_contrasena(self, token: str, contrasena: str) -> None:
        token_hash = self._hash_token(token.strip())
        reset_row = await self.reset_repository.obtener_valido(token_hash)
        if not reset_row:
            raise ValueError("El enlace de recuperación es inválido o ha caducado")

        usuario = await self.repository.obtener_por_id_login(reset_row.usuario_id)
        if not usuario or usuario.bloqueado_permanente:
            raise ValueError(MSG_BLOQUEO_PERMANENTE)

        usuario.password_hash = hash_password(contrasena)
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        usuario.bloqueos_temporales = 0
        await self.reset_repository.marcar_usado(reset_row)
        await self.repository.actualizar(usuario)

    async def cambiar_contrasena(
        self, usuario_id: int, empresa_id: int, contrasena_actual: str, contrasena_nueva: str
    ) -> None:
        usuario = await self.repository.obtener_por_id_login(usuario_id)
        if not usuario or usuario.empresa_id != empresa_id:
            raise ValueError("Usuario no encontrado")
        if not verify_password(contrasena_actual, usuario.password_hash):
            raise ValueError("La contraseña actual es incorrecta")

        usuario.password_hash = hash_password(contrasena_nueva)
        await self.repository.actualizar(usuario)

    async def validar_token(self, payload: dict[str, Any]) -> bool:
        usuario_id = payload.get("usuario_id")
        empresa_id = payload.get("empresa_id")
        if not usuario_id or not empresa_id:
            return False
        usuario = await self.repository.obtener_por_id(usuario_id, empresa_id)
        return usuario is not None and usuario.activo
