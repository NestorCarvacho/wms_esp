"""Corrige parámetros RBAC mal insertados en endpoints."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENDPOINTS = ROOT / "app" / "api" / "v1" / "endpoints"


def fix_content(content: str) -> str:
    # usuario_autenticado + _perm duplicado → solo requiere_permiso en usuario_autenticado
    content = re.sub(
        r"usuario_autenticado: dict = Depends\(obtener_usuario_autenticado\),\s*"
        r"(?:es_admin: bool = Depends\(es_super_admin\),\s*)?"
        r"service: ([^\n]+)\s*,?\s*\n\s*_perm: dict = Depends\(requiere_permiso\(\"([^\"]+)\"\)\),",
        lambda m: (
            f'usuario_autenticado: dict = Depends(requiere_permiso("{m.group(2)}")),\n'
            + (f"    es_admin: bool = Depends(es_super_admin),\n" if "es_admin" in m.group(0) else "")
            + f"    service: {m.group(1)},"
        ),
        content,
        flags=re.MULTILINE,
    )

    # _perm suelto cuando ya hay usuario_autenticado con requiere_permiso
    content = re.sub(
        r",?\s*\n\s*_perm: dict = Depends\(requiere_permiso\(\"[^\"]+\"\)\),\s*\n(\s*\):)",
        r"\n\1",
        content,
    )

    # service line rota: Depends(...)\n,\n    _perm
    content = re.sub(
        r"(= Depends\([^\)]+\))\s*,\s*\n\s*_perm: dict = Depends\(requiere_permiso\(\"([^\"]+)\"\)\),",
        r"\1,",
        content,
    )

    # importar sin permiso
    content = content.replace(
        "async def importar_productos(\n    archivo: UploadFile = File(...),\n    usuario_autenticado: dict = Depends(obtener_usuario_autenticado),",
        'async def importar_productos(\n    archivo: UploadFile = File(...),\n    usuario_autenticado: dict = Depends(requiere_permiso("productos.importar")),',
    )

    return content


def main() -> None:
    for path in ENDPOINTS.glob("*.py"):
        original = path.read_text(encoding="utf-8")
        fixed = fix_content(original)
        if fixed != original:
            path.write_text(fixed, encoding="utf-8")
            print(f"FIXED {path.name}")


if __name__ == "__main__":
    main()
