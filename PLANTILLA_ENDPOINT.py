"""
PLANTILLA: Endpoint de Ejemplo
Este archivo es una plantilla para crear nuevos endpoints siguiendo la arquitectura de capas.

Reemplazar:
- NOMBRE_RECURSO por el nombre real (ej: Producto, Empresa, etc.)
- nombre_recurso por la versión en minúsculas
"""

# ============ 1. CREAR DTO (schemas/nombre_recurso.py) ============
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class NombreRecursoCrearDTO(BaseModel):
    campo1: str = Field(..., min_length=1, max_length=255)
    campo2: Optional[int] = None

class NombreRecursoRespuestaDTO(BaseModel):
    id: int
    campo1: str
    campo2: Optional[int]
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True
"""

# ============ 2. CREAR MODELO ORM (infrastructure/models/nombre_recurso.py) ============
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infrastructure.models.usuario import Base

class NombreRecurso(Base):
    __tablename__ = "nombre_recursos"
    
    id = Column(Integer, primary_key=True, index=True)
    empresa_id = Column(Integer, ForeignKey("empresas.empresa_id"), nullable=False, index=True)
    campo1 = Column(String(255), nullable=False)
    campo2 = Column(Integer, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<NombreRecurso(id={self.id}, empresa_id={self.empresa_id})>"
"""

# ============ 3. CREAR REPOSITORIO (infrastructure/repositories/nombre_recurso_repository.py) ============
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infrastructure.models.nombre_recurso import NombreRecurso

class NombreRecursoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def crear(self, empresa_id: int, **kwargs) -> NombreRecurso:
        # Crear registro
        # Filtrar por empresa_id SIEMPRE
        pass
    
    async def obtener_por_id(self, id: int, empresa_id: int) -> NombreRecurso | None:
        # Obtener por ID filtrando por empresa_id
        stmt = select(NombreRecurso).where(
            NombreRecurso.id == id,
            NombreRecurso.empresa_id == empresa_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
"""

# ============ 4. CREAR SERVICIO (domain/services/nombre_recurso_service.py) ============
"""
class NombreRecursoService:
    def __init__(self, nombre_recurso_repository):
        self.repo = nombre_recurso_repository
    
    async def crear(self, empresa_id: int, **kwargs):
        # Validaciones de negocio
        # Llamar al repositorio
        pass
"""

# ============ 5. CREAR ENDPOINT (api/v1/endpoints/nombre_recurso.py) ============
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database import get_db_session
from app.schemas.nombre_recurso import NombreRecursoCrearDTO, NombreRecursoRespuestaDTO
from app.api.v1.dependencies import obtener_usuario_autenticado, obtener_empresa_id

router = APIRouter(
    prefix="/api/v1/nombre_recursos",
    tags=["Nombre Recursos"]
)

@router.post("/", response_model=dict)
async def crear_nombre_recurso(
    datos: NombreRecursoCrearDTO,
    empresa_id: int = Depends(obtener_empresa_id),
    session: AsyncSession = Depends(get_db_session)
):
    # 1. Crear repositorio y servicio
    # 2. Validar y crear
    # 3. Retornar con RespuestaAPIDTO
    pass
"""

# ============ NOTAS IMPORTANTES ============
"""
✓ SIEMPRE filtrar por empresa_id en SELECT
✓ NUNCA aceptar empresa_id como parámetro de entrada (extraer del JWT)
✓ SIEMPRE retornar RespuestaAPIDTO
✓ SIEMPRE validar en DTOs con Pydantic
✓ SIEMPRE usar AsyncSession para operaciones BD
✓ SIEMPRE usar transacciones para operaciones críticas
✓ SIEMPRE registrar cambios en auditoría
✓ NO exponer contraseñas, tokens o datos sensibles en respuestas
"""
