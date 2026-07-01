"""Puertos del bounded context notifications."""
from __future__ import annotations

from typing import Any, Protocol


class IStockRealtimePublisher(Protocol):
    async def publish_stock_event(
        self,
        empresa_id: int,
        event_type: str,
        payload: dict[str, Any],
    ) -> None: ...


class ITransactionalEmailSender(Protocol):
    async def send_html(
        self,
        *,
        to: str | list[str],
        subject: str,
        html: str,
    ) -> None: ...


class INotificacionRepository(Protocol):
    async def listar(
        self,
        usuario_id: int,
        *,
        pagina: int = 1,
        por_pagina: int = 10,
        leida: bool | None = None,
    ) -> tuple[list[Any], int]: ...

    async def contar_no_leidas(self, usuario_id: int) -> int: ...

    async def crear(
        self,
        *,
        empresa_id: int,
        usuario_id: int,
        tipo: str,
        titulo: str,
        mensaje: str | None = None,
        payload: dict[str, Any] | None = None,
    ) -> Any: ...

    async def marcar_leida(self, notificacion_id: int, usuario_id: int) -> bool: ...

    async def marcar_todas_leidas(self, usuario_id: int) -> int: ...


class INotificationDispatcher(Protocol):
    async def publish_stock_event(
        self,
        empresa_id: int,
        event_type: str,
        payload: dict[str, Any],
    ) -> None: ...

    async def send_alert_email(
        self,
        *,
        to: str | list[str],
        subject: str,
        html: str,
    ) -> None: ...

    async def notify_stock_critical(
        self,
        empresa_id: int,
        usuario_id: int,
        payload: dict[str, Any],
        *,
        email_to: str | list[str] | None = None,
    ) -> None: ...
