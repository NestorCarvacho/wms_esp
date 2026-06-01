"""Provisiona permisos y roles estándar en una empresa nueva o existente."""
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.services.empresa_maestra_service import EmpresaMaestraService
from app.infrastructure.repositories.empresa_administrada_repository import EmpresaAdministradaRepository
from app.infrastructure.repositories.empresa_crud_repository import EmpresaCRUDRepository
from app.infrastructure.repositories.empresa_rbac_bootstrap_repository import EmpresaRbacBootstrapRepository

PLANTILLA_EMPRESA_ID = 1


class EmpresaRbacBootstrapService:
    def __init__(
        self,
        repository: EmpresaRbacBootstrapRepository,
        empresa_repository: EmpresaCRUDRepository,
        session: AsyncSession,
    ):
        self.repository = repository
        self.empresa_repository = empresa_repository
        self.session = session

    async def _validar_acceso(self, usuario: dict, empresa_destino_id: int) -> None:
        empresa_caller = usuario.get("empresa_id")
        es_maestra = bool(usuario.get("es_empresa_maestra"))

        if not es_maestra:
            if empresa_destino_id != empresa_caller:
                raise ValueError("No autorizado para provisionar RBAC de esta empresa")
            return

        maestra = EmpresaMaestraService(EmpresaAdministradaRepository(self.session))
        await maestra.validar_acceso(empresa_caller, empresa_destino_id)

    async def provisionar(
        self,
        empresa_destino_id: int,
        usuario: dict | None = None,
        empresa_plantilla_id: int = PLANTILLA_EMPRESA_ID,
    ) -> dict[str, Any]:
        if empresa_destino_id == empresa_plantilla_id:
            raise ValueError("La empresa plantilla ya tiene el catálogo RBAC base")

        empresa = await self.empresa_repository.obtener_por_id(empresa_destino_id)
        if not empresa:
            raise ValueError("Empresa no encontrada")

        plantilla = await self.empresa_repository.obtener_por_id(empresa_plantilla_id)
        if not plantilla:
            raise ValueError("Empresa plantilla RBAC no encontrada")

        permisos_plantilla = await self.repository.contar_permisos(empresa_plantilla_id)
        if permisos_plantilla == 0:
            raise ValueError("La empresa plantilla no tiene permisos configurados")

        if usuario is not None:
            await self._validar_acceso(usuario, empresa_destino_id)

        try:
            permisos_antes = await self.repository.contar_permisos(empresa_destino_id)
            permisos_creados = await self.repository.copiar_permisos(
                empresa_plantilla_id, empresa_destino_id
            )
            await self.session.flush()

            roles_plantilla = await self.repository.listar_roles_activos(empresa_plantilla_id)
            roles_provisionados = 0
            for rol_plantilla in roles_plantilla:
                rol_destino = await self.repository.asegurar_rol(
                    empresa_destino_id,
                    rol_plantilla.nombre,
                    rol_plantilla.descripcion,
                )
                roles_provisionados += 1
                codigos = await self.repository.codigos_permiso_de_rol(rol_plantilla.id)
                permiso_ids = await self.repository.ids_por_codigos(empresa_destino_id, codigos)
                await self.repository.reemplazar_rol_permiso(rol_destino.id, permiso_ids)

            await self.repository.commit()
            permisos_despues = await self.repository.contar_permisos(empresa_destino_id)

            return {
                "empresa_id": empresa_destino_id,
                "empresa_plantilla_id": empresa_plantilla_id,
                "permisos_antes": permisos_antes,
                "permisos_creados": permisos_creados,
                "total_permisos": permisos_despues,
                "roles_provisionados": roles_provisionados,
                "ya_existia_catalogo": permisos_antes > 0,
            }
        except Exception:
            await self.repository.rollback()
            raise
