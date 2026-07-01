"""Adaptador SQLAlchemy — bandeja de notificaciones."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.usuario import Notificacion


class SqlAlchemyNotificacionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def listar(
        self,
        usuario_id: int,
        *,
        pagina: int = 1,
        por_pagina: int = 10,
        leida: bool | None = None,
    ) -> tuple[list[Any], int]:
        stmt = select(Notificacion).where(Notificacion.usuario_id == usuario_id)
        count_stmt = select(func.count(Notificacion.id)).where(Notificacion.usuario_id == usuario_id)
        if leida is not None:
            stmt = stmt.where(Notificacion.leida == leida)
            count_stmt = count_stmt.where(Notificacion.leida == leida)
        total = (await self.session.execute(count_stmt)).scalar() or 0
        offset = (pagina - 1) * por_pagina
        result = await self.session.execute(
            stmt.order_by(Notificacion.creado_at.desc()).offset(offset).limit(por_pagina)
        )
        return result.scalars().all(), total

    async def contar_no_leidas(self, usuario_id: int) -> int:
        stmt = select(func.count(Notificacion.id)).where(
            Notificacion.usuario_id == usuario_id,
            Notificacion.leida == False,  # noqa: E712
        )
        return (await self.session.execute(stmt)).scalar() or 0

    async def crear(
        self,
        *,
        empresa_id: int,
        usuario_id: int,
        tipo: str,
        titulo: str,
        mensaje: str | None = None,
        payload: dict[str, Any] | None = None,
    ) -> Notificacion:
        n = Notificacion(
            empresa_id=empresa_id,
            usuario_id=usuario_id,
            tipo=tipo,
            titulo=titulo,
            mensaje=mensaje,
            payload_json=payload,
            leida=False,
            creado_at=datetime.utcnow(),
        )
        self.session.add(n)
        await self.session.commit()
        await self.session.refresh(n)
        return n

    async def marcar_leida(self, notificacion_id: int, usuario_id: int) -> bool:
        stmt = (
            update(Notificacion)
            .where(
                Notificacion.id == notificacion_id,
                Notificacion.usuario_id == usuario_id,
            )
            .values(leida=True, leida_at=datetime.utcnow())
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0

    async def marcar_todas_leidas(self, usuario_id: int) -> int:
        stmt = (
            update(Notificacion)
            .where(
                Notificacion.usuario_id == usuario_id,
                Notificacion.leida == False,  # noqa: E712
            )
            .values(leida=True, leida_at=datetime.utcnow())
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount or 0
