"""Servicio CRUD de Empresas — fachada módulo tenant."""
from __future__ import annotations

from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.bootstrap.tenant_container import build_tenant_handlers
from app.modules.tenant.application.commands import ActualizarEmpresaCommand, CrearEmpresaCommand


class EmpresaService:
    def __init__(self, session: AsyncSession):
        self._handlers = build_tenant_handlers(session)

    async def listar_empresas(
        self,
        pagina: int = 1,
        por_pagina: int = 10,
        solo_activas: bool = False,
        buscar: Optional[str] = None,
        ordenar_por: Optional[str] = None,
        orden: Optional[str] = None,
    ) -> dict[str, Any]:
        try:
            return await self._handlers.listar_empresas.handle(
                pagina=pagina,
                por_pagina=por_pagina,
                solo_activas=solo_activas,
                buscar=buscar,
                ordenar_por=ordenar_por,
                orden=orden,
            )
        except Exception as e:
            raise Exception(f"Error al listar empresas: {str(e)}") from e

    async def obtener_empresa(self, empresa_id: int) -> dict[str, Any]:
        try:
            return await self._handlers.obtener_empresa.handle(empresa_id)
        except ValueError:
            raise
        except Exception as e:
            raise Exception(f"Error al obtener empresa: {str(e)}") from e

    async def crear_empresa(self, codigo: str, razon_social: str, **kwargs: Any) -> dict[str, Any]:
        try:
            return await self._handlers.crear_empresa.handle(
                CrearEmpresaCommand(codigo=codigo, razon_social=razon_social, campos=kwargs)
            )
        except ValueError:
            raise
        except Exception as e:
            raise Exception(f"Error al crear empresa: {str(e)}") from e

    async def actualizar_empresa(self, empresa_id: int, **kwargs: Any) -> dict[str, Any]:
        try:
            return await self._handlers.actualizar_empresa.handle(
                ActualizarEmpresaCommand(empresa_id=empresa_id, campos=kwargs)
            )
        except ValueError:
            raise
        except Exception as e:
            raise Exception(f"Error al actualizar empresa: {str(e)}") from e

    async def eliminar_empresa(self, empresa_id: int) -> dict[str, str]:
        try:
            return await self._handlers.inhabilitar_empresa.handle(empresa_id)
        except ValueError:
            raise
        except Exception as e:
            raise Exception(f"Error al eliminar empresa: {str(e)}") from e
