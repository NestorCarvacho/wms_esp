"""Helpers para listados paginados con búsqueda."""
from sqlalchemy import or_


def condicion_buscar(model, buscar: str | None, *fields: str):
    """Genera OR de columnas LIKE %buscar% (MySQL utf8mb4_ci)."""
    if not buscar or not str(buscar).strip():
        return None
    pattern = f"%{str(buscar).strip()}%"
    clauses = []
    for field in fields:
        column = getattr(model, field, None)
        if column is not None:
            clauses.append(column.like(pattern))
    return or_(*clauses) if clauses else None
