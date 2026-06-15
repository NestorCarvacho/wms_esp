"""Cliente de correo transaccional con Resend (https://resend.com/)."""
import asyncio
import logging
import re
from typing import Any

import resend

from app.core.config import (
    APP_NAME,
    DEBUG,
    EMAIL_DEV_LOG_ONLY,
    EMAIL_FROM,
    FRONTEND_URL,
    PASSWORD_RESET_EXPIRE_MINUTES,
    RESEND_API_KEY,
)

logger = logging.getLogger(__name__)

# Gmail/Outlook no pueden usarse como remitente; solo dominio verificado en Resend.
_DOMINIOS_NO_PERMITIDOS = frozenset(
    {
        "gmail.com",
        "googlemail.com",
        "hotmail.com",
        "outlook.com",
        "live.com",
        "yahoo.com",
        "icloud.com",
        "me.com",
        "proton.me",
        "protonmail.com",
    }
)


def _extraer_email(from_addr: str) -> str:
    match = re.search(r"<([^>]+)>", from_addr)
    if match:
        return match.group(1).strip().lower()
    return from_addr.strip().lower()


def _validar_remitente(from_addr: str) -> None:
    email = _extraer_email(from_addr)
    if "@" not in email:
        raise ValueError(
            "EMAIL_FROM inválido. Desarrollo: onboarding@resend.dev "
            "o active EMAIL_DEV_LOG_ONLY=True para imprimir el enlace en consola."
        )
    dominio = email.rsplit("@", 1)[1]
    if dominio in _DOMINIOS_NO_PERMITIDOS:
        raise ValueError(
            "EMAIL_FROM no puede ser Gmail, Outlook ni Yahoo. "
            "Use Khepri Software <noreply@tudominio.com> con el dominio verificado en "
            "https://resend.com/domains"
        )


def _traducir_error_resend(exc: Exception) -> ValueError:
    msg = str(exc).lower()
    if "not verified" in msg or "domain" in msg:
        return ValueError(
            "El dominio del remitente no está verificado en Resend. "
            "En local use EMAIL_DEV_LOG_ONLY=True (enlace en consola) o "
            "EMAIL_FROM=onboarding@resend.dev (solo al email de su cuenta Resend)."
        )
    if "only send testing emails" in msg or "testing emails" in msg:
        return ValueError(
            "Resend en modo sandbox: solo puede enviar al email de su cuenta Resend, "
            "o active EMAIL_DEV_LOG_ONLY=True para pruebas locales sin correo."
        )
    return ValueError(f"No se pudo enviar el correo: {exc}")


def _configure_resend() -> None:
    if not RESEND_API_KEY:
        raise ValueError(
            "RESEND_API_KEY no configurada. Agregue su clave re_… en .env "
            "(obtenerla en https://resend.com/api-keys)"
        )
    resend.api_key = RESEND_API_KEY


def send_email_sync(
    *,
    to: str | list[str],
    subject: str,
    html: str,
    from_addr: str | None = None,
) -> dict[str, Any]:
    """
    Envía un correo con la API de Resend (mismo patrón que la documentación oficial).

    ```python
    import resend
    resend.api_key = "re_xxxxxxxxx"
    resend.Emails.send({"from": "...", "to": "...", "subject": "...", "html": "..."})
    ```
    """
    remitente = from_addr or EMAIL_FROM
    _validar_remitente(remitente)
    _configure_resend()

    destinatarios = [to] if isinstance(to, str) else list(to)
    try:
        return resend.Emails.send(
            {
                "from": remitente,
                "to": destinatarios,
                "subject": subject,
                "html": html,
            }
        )
    except Exception as exc:
        raise _traducir_error_resend(exc) from exc


async def send_email(
    *,
    to: str | list[str],
    subject: str,
    html: str,
    from_addr: str | None = None,
) -> dict[str, Any]:
    return await asyncio.to_thread(
        send_email_sync,
        to=to,
        subject=subject,
        html=html,
        from_addr=from_addr,
    )


def _send_password_reset_sync(to: str, reset_url: str) -> None:
    send_email_sync(
        to=to,
        subject=f"Recuperar contraseña — {APP_NAME}",
        html=f"""
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
          <h2 style="color: #1565C0;">Recuperación de contraseña</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en {APP_NAME}.</p>
          <p>
            <a href="{reset_url}"
               style="display:inline-block;padding:12px 20px;background:#1565C0;color:#fff;
                      text-decoration:none;border-radius:6px;font-weight:600;">
              Restablecer contraseña
            </a>
          </p>
          <p style="color:#666;font-size:14px;">
            Este enlace caduca en {PASSWORD_RESET_EXPIRE_MINUTES} minutos.
            Si no solicitaste este cambio, ignora este correo.
          </p>
        </div>
        """,
    )


async def send_password_reset_email(to: str, raw_token: str) -> None:
    reset_url = f"{FRONTEND_URL}/restablecer-contrasena?token={raw_token}"

    if EMAIL_DEV_LOG_ONLY:
        banner = (
            "\n"
            "========== RECUPERACIÓN DE CONTRASEÑA (modo desarrollo) ==========\n"
            f"Usuario: {to}\n"
            f"Enlace (válido {PASSWORD_RESET_EXPIRE_MINUTES} min):\n{reset_url}\n"
            "==================================================================\n"
        )
        print(banner, flush=True)
        logger.warning("Recuperación en modo desarrollo (sin correo). Enlace: %s", reset_url)
        return

    if not RESEND_API_KEY:
        if DEBUG:
            logger.warning("RESEND_API_KEY no configurada. Enlace de recuperación: %s", reset_url)
            return
        raise ValueError("El servicio de correo no está configurado")

    await asyncio.to_thread(_send_password_reset_sync, to, reset_url)
