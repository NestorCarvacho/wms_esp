"""Relación empresa maestra ↔ empresas administradas."""
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey

from app.infrastructure.models.usuario import Base


class EmpresaAdministrada(Base):
    __tablename__ = "empresa_administrada"

    empresa_maestra_id = Column(
        BigInteger,
        ForeignKey("empresa.id"),
        primary_key=True,
    )
    empresa_administrada_id = Column(
        BigInteger,
        ForeignKey("empresa.id"),
        primary_key=True,
    )
    activo = Column(Boolean, default=True)
    creado_at = Column(DateTime, default=datetime.utcnow)
