"""Helpers para listados paginados con búsqueda y orden."""
from sqlalchemy import asc, desc, or_


def filtro_empresa(
    model,
    empresa_id: int,
    es_super_admin: bool,
    empresa_id_filtro: int | None = None,
    empresas_scope_ids: list[int] | None = None,
):
    """
    Condición WHERE multi-tenant.
    Empresa maestra con filtro: solo esa empresa.
    Empresa maestra sin filtro: empresas administradas (IN).
    Usuario normal: siempre su empresa_id.
    """
    if es_super_admin:
        if empresa_id_filtro is not None:
            return model.empresa_id == empresa_id_filtro
        if empresas_scope_ids:
            return model.empresa_id.in_(empresas_scope_ids)
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


def aplicar_orden(
    stmt,
    *,
    columnas: dict[str, object],
    ordenar_por: str | None,
    orden: str | None = None,
    default: object | None = None,
    default_orden: str = "asc",
):
    """
    Aplica ORDER BY validando el campo contra un mapa permitido.
    Si no hay ordenar_por, usa `default` con `default_orden`.
    """
    col = None
    direction = (orden or "asc").strip().lower()

    if ordenar_por and ordenar_por in columnas:
        col = columnas[ordenar_por]
    elif default is not None:
        col = default
        if ordenar_por is None:
            direction = default_orden.strip().lower()

    if col is None:
        return stmt

    if direction not in ("asc", "desc"):
        direction = "asc"

    return stmt.order_by(desc(col) if direction == "desc" else asc(col))
