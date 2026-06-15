"""Repositorio de tokens de recuperación de contraseña."""
from datetime import datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.infrastructure.models.usuario import PasswordResetToken


class PasswordResetRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def hay_solicitud_reciente(self, usuario_id: int, cooldown_minutes: int) -> bool:
        if cooldown_minutes <= 0:
            return False
        since = datetime.utcnow() - timedelta(minutes=cooldown_minutes)
        stmt = (
            select(PasswordResetToken.id)
            .where(
                PasswordResetToken.usuario_id == usuario_id,
                PasswordResetToken.creado_at >= since,
            )
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def invalidar_pendientes(self, usuario_id: int) -> None:
        await self.session.execute(
            delete(PasswordResetToken).where(
                PasswordResetToken.usuario_id == usuario_id,
                PasswordResetToken.usado_at.is_(None),
            )
        )

    async def crear(self, usuario_id: int, token_hash: str, expira_at: datetime) -> PasswordResetToken:
        try:
            await self.invalidar_pendientes(usuario_id)
            token = PasswordResetToken(
                usuario_id=usuario_id,
                token_hash=token_hash,
                expira_at=expira_at,
            )
            self.session.add(token)
            await self.session.flush()
            return token
        except SQLAlchemyError as e:
            raise Exception(f"Error al crear token de recuperación: {str(e)}") from e

    async def obtener_valido(self, token_hash: str) -> PasswordResetToken | None:
        now = datetime.utcnow()
        stmt = select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.usado_at.is_(None),
            PasswordResetToken.expira_at > now,
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def marcar_usado(self, token: PasswordResetToken) -> None:
        token.usado_at = datetime.utcnow()
        self.session.add(token)
