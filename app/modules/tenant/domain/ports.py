"""Puertos del bounded context tenant."""
from __future__ import annotations

from typing import Any, Protocol


class ITenantRepository(Protocol):
    async def es_empresa_maestra(self, empresa_id: int) -> bool: ...

    async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> None: ...

    async def empresa_esta_operativa(self, empresa_id: int) -> bool: ...

    async def listar_empresas_administradas(
        self, empresa_maestra_id: int, *, solo_activas: bool = True
    ) -> list[Any]: ...

    async def ids_empresas_administradas_activas(self, empresa_maestra_id: int) -> list[int]: ...
