"""
PLANTILLA: Endpoint hexagonal
Patrón actual: router → handler (módulo) → port → adaptador SQL.

Reemplazar NOMBRE_RECURSO / nombre_recurso / <contexto> según el bounded context.
Ver docs/ARCHITECTURE.md y docs/CONTRIBUTING.md
"""

# ============ 1. DTO (app/schemas/nombre_recurso.py) ============
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class NombreRecursoCrearDTO(BaseModel):
    campo1: str = Field(..., min_length=1, max_length=255)

class NombreRecursoRespuestaDTO(BaseModel):
    id: int
    campo1: str
    fecha_creacion: datetime
    model_config = {"from_attributes": True}
"""

# ============ 2. PUERTO (app/modules/<contexto>/domain/ports.py) ============
"""
from typing import Protocol

class INombreRecursoRepository(Protocol):
    async def crear(self, empresa_id: int, **kwargs) -> dict: ...
    async def obtener_por_id(self, id: int, empresa_id: int) -> dict | None: ...
"""

# ============ 3. ADAPTADOR (app/modules/<contexto>/infrastructure/nombre_recurso_repository.py) ============
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infrastructure.models.nombre_recurso import NombreRecurso

class SqlAlchemyNombreRecursoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def crear(self, empresa_id: int, **kwargs) -> dict:
        entidad = NombreRecurso(empresa_id=empresa_id, **kwargs)
        self.session.add(entidad)
        await self.session.flush()
        return {"id": entidad.id, "campo1": entidad.campo1}
"""

# ============ 4. HANDLER (app/modules/<contexto>/application/handlers/nombre_recurso_handlers.py) ============
"""
from app.modules.<contexto>.domain.ports import INombreRecursoRepository

class CrearNombreRecursoHandler:
    def __init__(self, repo: INombreRecursoRepository):
        self.repo = repo

    async def handle(self, empresa_id: int, campo1: str) -> dict:
        return await self.repo.crear(empresa_id=empresa_id, campo1=campo1)
"""

# ============ 5. COMPOSITION ROOT (app/bootstrap/<contexto>_container.py) ============
"""
@dataclass
class ContextoHandlers:
    crear_nombre_recurso: CrearNombreRecursoHandler

def build_<contexto>_handlers(session: AsyncSession) -> ContextoHandlers:
    repo = SqlAlchemyNombreRecursoRepository(session)
    return ContextoHandlers(crear_nombre_recurso=CrearNombreRecursoHandler(repo))
"""

# ============ 6. ENDPOINT (app/api/v1/endpoints/nombre_recurso.py) ============
"""
from fastapi import APIRouter, Depends
from app.api.v1.empresa_contexto import ContextoEmpresa, contexto_requiere_permiso, kwargs_listado
from app.bootstrap.<contexto>_container import ContextoHandlers, build_<contexto>_handlers
from app.modules.<contexto>.presentation.http.dependencies import obtener_<contexto>_handlers
from app.schemas.nombre_recurso import NombreRecursoCrearDTO, RespuestaAPIDTO

router = APIRouter(prefix="/api/v1/nombre_recursos", tags=["Nombre Recursos"])

@router.post("/", response_model=RespuestaAPIDTO)
async def crear(
    datos: NombreRecursoCrearDTO,
    ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("nombre_recursos.crear")),
    handlers: ContextoHandlers = Depends(obtener_<contexto>_handlers),
):
    resultado = await handlers.crear_nombre_recurso.handle(
        empresa_id=ctx.empresa_operacion(),
        campo1=datos.campo1,
    )
    return RespuestaAPIDTO(exito=True, datos=resultado, mensaje="Creado")
"""

# ============ NOTAS ============
"""
✓ Filtrar por empresa_id en adaptadores
✓ Inyectar handlers con Depends — no SQL en endpoints
✓ Validar permisos con contexto_requiere_permiso
✓ Pasar lint-imports (domain/application sin SQLAlchemy)
✓ Registrar permiso en SQL + menuConfig.ts + App.tsx si hay UI
"""
