"""Query params comunes para listados paginados."""
from fastapi import Query


def orden_listado(
    ordenar_por: str | None = Query(None, description="Campo para ordenar (whitelist por endpoint)"),
    orden: str | None = Query(None, description="asc o desc"),
) -> dict[str, str | None]:
    direction = (orden or "asc").strip().lower()
    if direction not in ("asc", "desc"):
        direction = "asc"
    return {"ordenar_por": ordenar_por, "orden": direction}
