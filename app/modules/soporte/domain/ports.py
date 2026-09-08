"""Puertos del bounded context soporte."""
from __future__ import annotations

from typing import Any, Protocol


class ITicketRepository(Protocol):
    async def listar_tipos(self) -> list[dict[str, Any]]: ...

    async def obtener_tipo_activo(self, tipo_id: int) -> dict[str, Any] | None: ...

    async def tipo_tiene_hijos_activos(self, tipo_id: int) -> bool: ...

    async def obtener_estado_por_codigo(self, codigo: str) -> dict[str, Any] | None: ...

    async def datos_solicitante(self, usuario_id: int) -> dict[str, Any] | None: ...

    async def crear(
        self,
        *,
        empresa_id: int,
        usuario_id: int,
        tipo_solicitud_id: int,
        estado_ticket_id: int,
        asunto: str,
        nombre_solicitante: str,
        nombre_empresa: str,
        mensaje: str,
        mensaje_sistema: str,
    ) -> int: ...

    async def listar(self, **kwargs: Any) -> tuple[list[dict[str, Any]], int]: ...

    async def obtener(self, ticket_id: int) -> dict[str, Any] | None: ...

    async def agregar_mensaje(
        self,
        ticket_id: int,
        cuerpo: str,
        usuario_id: int | None = None,
        es_sistema: bool = False,
    ) -> None: ...

    async def cambiar_estado(
        self,
        ticket_id: int,
        estado_ticket_id: int,
        cerrado: bool,
    ) -> None: ...

    async def tomar(self, ticket_id: int, usuario_id: int) -> None: ...
