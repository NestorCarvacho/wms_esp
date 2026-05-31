"""Helpers para mostrar nombres legibles en respuestas API."""


def format_empresa_nombre(empresa) -> str | None:
    if empresa is None:
        return None
    codigo = getattr(empresa, "codigo", None)
    nombre = getattr(empresa, "nombre", None)
    if codigo and nombre:
        return f"{codigo} — {nombre}"
    return nombre or codigo
