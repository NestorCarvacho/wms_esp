"""Lógica de negocio multiempresa (empresa maestra)."""
from typing import Any

from app.domain.services.display_helpers import format_empresa_nombre
from app.infrastructure.repositories.empresa_administrada_repository import EmpresaAdministradaRepository


class EmpresaMaestraService:
    def __init__(self, repository: EmpresaAdministradaRepository):
        self.repository = repository

    async def usuario_es_empresa_maestra(self, empresa_id: int) -> bool:
        return await self.repository.es_empresa_maestra(empresa_id)

    async def listar_administradas(
        self, empresa_maestra_id: int, *, incluir_inactivas: bool = False
    ) -> dict[str, Any]:
        es_maestra = await self.repository.es_empresa_maestra(empresa_maestra_id)
        if not es_maestra and empresa_maestra_id != 1:
            raise ValueError("La empresa no está configurada como maestra")
        solo_activas = not incluir_inactivas
        empresas = await self.repository.listar_empresas_administradas(
            empresa_maestra_id, solo_activas=solo_activas
        )
        return {
            "total": len(empresas),
            "empresas": [
                {
                    "id": e.id,
                    "codigo": e.codigo,
                    "razon_social": e.razon_social,
                    "rut": e.rut,
                    "esta_activa": e.esta_activa,
                    "es_empresa_maestra": bool(e.es_empresa_maestra),
                    "empresa_nombre": format_empresa_nombre(e),
                }
                for e in empresas
            ],
        }

    async def assert_operativa_para_escritura(self, empresa_id: int) -> None:
        if not await self.repository.empresa_esta_operativa(empresa_id):
            raise ValueError(
                "La empresa está inhabilitada. Actívela desde Configuración → Empresas "
                "para crear o modificar registros."
            )

    async def validar_acceso(self, empresa_maestra_id: int, empresa_objetivo_id: int) -> None:
        if not await self.repository.puede_administrar(empresa_maestra_id, empresa_objetivo_id):
            raise ValueError("No tiene permiso para operar sobre esta empresa")

    async def ids_administradas(self, empresa_maestra_id: int) -> list[int]:
        if not await self.repository.es_empresa_maestra(empresa_maestra_id):
            return [empresa_maestra_id]
        ids = await self.repository.ids_empresas_administradas_activas(empresa_maestra_id)
        return ids or [empresa_maestra_id]
