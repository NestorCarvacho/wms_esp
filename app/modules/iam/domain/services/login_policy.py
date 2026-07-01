"""Reglas de bloqueo y estado de cuenta en login."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from app.core.config import LOGIN_LOCKOUT_MINUTES, LOGIN_MAX_ATTEMPTS
from app.modules.iam.domain.constants import MSG_BLOQUEO_PERMANENTE, MSG_CREDENCIALES


def validar_estado_login(usuario: Any, now: datetime | None = None) -> None:
    now = now or datetime.utcnow()
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


def aplicar_fallo_login(usuario: Any, now: datetime | None = None) -> None:
    """Mutates usuario and raises ValueError with appropriate message."""
    now = now or datetime.utcnow()
    usuario.intentos_fallidos = (usuario.intentos_fallidos or 0) + 1
    if usuario.intentos_fallidos < LOGIN_MAX_ATTEMPTS:
        raise ValueError(MSG_CREDENCIALES)

    usuario.intentos_fallidos = 0
    usuario.bloqueos_temporales = (usuario.bloqueos_temporales or 0) + 1
    if usuario.bloqueos_temporales >= 2:
        usuario.bloqueado_permanente = True
        usuario.activo = False
        usuario.bloqueado_hasta = None
        raise ValueError(MSG_BLOQUEO_PERMANENTE)

    usuario.bloqueado_hasta = now + timedelta(minutes=LOGIN_LOCKOUT_MINUTES)
    raise ValueError(
        f"Demasiados intentos fallidos. Cuenta bloqueada por {LOGIN_LOCKOUT_MINUTES} minutos."
    )
