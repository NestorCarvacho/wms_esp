"""Helpers para listados paginados con búsqueda."""
from sqlalchemy import or_


def filtro_empresa(
    model,
    empresa_id: int,
    es_super_admin: bool,
    empresa_id_filtro: int | None = None,
):
    """
    Condición WHERE multi-tenant.
    Super admin sin filtro: None (sin restricción).
    Super admin con empresa_id_filtro: solo esa empresa.
    Usuario normal: siempre su empresa_id.
    """
    if es_super_admin:
        if empresa_id_filtro is not None:
            return model.empresa_id == empresa_id_filtro
        return None
    return model.empresa_id == empresa_id


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
