"""
Servicio CRUD de Empresas (Capa de Negocio).
"""
from typing import Dict, Any, Optional
from app.infrastructure.repositories.empresa_crud_repository import EmpresaCRUDRepository


def _empresa_dict(e) -> Dict[str, Any]:
    return {
        "id": e.id,
        "codigo": e.codigo,
        "razon_social": e.razon_social,
        "nombre_fantasia": e.nombre_fantasia,
        "rut": e.rut,
        "giro": e.giro,
        "telefono": e.telefono,
        "correo": e.correo,
        "sitio_web": e.sitio_web,
        "esta_activa": e.esta_activa,
        "es_empresa_maestra": bool(getattr(e, "es_empresa_maestra", False)),
        "creado_at": e.creado_at,
        "direccion": e.direccion,
        "region_id": e.region_id,
        "ciudad_id": e.ciudad_id,
        "comuna_id": e.comuna_id,
        "locale": getattr(e, "locale", "es-CL") or "es-CL",
        "timezone": getattr(e, "timezone", "America/Santiago") or "America/Santiago",
        "moneda_codigo": getattr(e, "moneda_codigo", "CLP") or "CLP",
    }


class EmpresaService:
    def __init__(self, repository: EmpresaCRUDRepository):
        self.repository = repository

    async def listar_empresas(
        self,
        pagina: int = 1,
        por_pagina: int = 10,
        solo_activas: bool = False,
        buscar: Optional[str] = None,
        ordenar_por: Optional[str] = None,
        orden: Optional[str] = None,
    ) -> Dict[str, Any]:
        try:
            empresas, total = await self.repository.listar(
                pagina=pagina,
                por_pagina=por_pagina,
                solo_activas=solo_activas,
                buscar=buscar,
                ordenar_por=ordenar_por,
                orden=orden,
            )
            return {
                "total": total,
                "pagina": pagina,
                "por_pagina": por_pagina,
                "empresas": [_empresa_dict(e) for e in empresas],
            }
        except Exception as e:
            raise Exception(f"Error al listar empresas: {str(e)}")

    async def obtener_empresa(self, empresa_id: int) -> Dict[str, Any]:
        try:
            empresa = await self.repository.obtener_por_id(empresa_id)
            if not empresa:
                raise ValueError("Empresa no encontrada")
            return _empresa_dict(empresa)
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error al obtener empresa: {str(e)}")

    async def crear_empresa(self, codigo: str, razon_social: str, **kwargs) -> Dict[str, Any]:
        try:
            empresa_existente = await self.repository.obtener_por_codigo(codigo)
            if empresa_existente:
                raise ValueError(f"El código de empresa '{codigo}' ya existe")
            empresa = await self.repository.crear(codigo=codigo, razon_social=razon_social, **kwargs)
            return _empresa_dict(empresa)
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error al crear empresa: {str(e)}")

    async def actualizar_empresa(self, empresa_id: int, **kwargs) -> Dict[str, Any]:
        try:
            empresa = await self.repository.actualizar(empresa_id, **kwargs)
            return _empresa_dict(empresa)
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error al actualizar empresa: {str(e)}")

    async def eliminar_empresa(self, empresa_id: int) -> Dict[str, str]:
        try:
            await self.repository.eliminar(empresa_id)
            return {"mensaje": f"Empresa con ID {empresa_id} inhabilitada correctamente"}
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise Exception(f"Error al eliminar empresa: {str(e)}")
