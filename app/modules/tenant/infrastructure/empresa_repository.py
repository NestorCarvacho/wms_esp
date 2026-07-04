"""Adaptador CRUD de empresas."""
from app.modules.tenant.infrastructure.empresa_crud import EmpresaCRUDRepository as SqlAlchemyEmpresaRepository

__all__ = ["SqlAlchemyEmpresaRepository"]
