"""Adaptador de correo transaccional con Resend."""
from __future__ import annotations

from app.infrastructure.email.resend_service import send_email
from app.modules.notifications.domain.ports import ITransactionalEmailSender


class ResendTransactionalEmailSender(ITransactionalEmailSender):
    async def send_html(
        self,
        *,
        to: str | list[str],
        subject: str,
        html: str,
    ) -> None:
        await send_email(to=to, subject=subject, html=html)
