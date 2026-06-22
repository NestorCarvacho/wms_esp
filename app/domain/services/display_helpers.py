"""Helpers para mostrar nombres legibles en respuestas API."""


def format_empresa_nombre(empresa) -> str | None:
    if empresa is None:
        return None
    codigo = getattr(empresa, "codigo", None)
    razon_social = getattr(empresa, "razon_social", None)
    if codigo and razon_social:
        return f"{codigo} — {razon_social}"
    return razon_social or codigo
