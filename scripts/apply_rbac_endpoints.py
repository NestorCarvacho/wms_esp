"""Aplica validación de permisos RBAC a endpoints CRUD."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENDPOINTS = ROOT / "app" / "api" / "v1" / "endpoints"

# (archivo, [(patrón en firma async def, permiso)])
RULES: list[tuple[str, list[tuple[str, str]]]] = [
    ("productos.py", [
        ("listar_Productos", "productos.leer"),
        ("descargar_plantilla_importacion", "productos.importar"),
        ("importar_productos", "productos.importar"),
        ("obtener_producto", "productos.leer"),
        ("crear_producto", "productos.crear"),
        ("actualizar_producto", "productos.editar"),
        ("eliminar_producto", "productos.eliminar"),
    ]),
    ("bodegas.py", [
        ("listar_bodegas", "bodegas.leer"),
        ("obtener_bodega", "bodegas.leer"),
        ("crear_bodega", "bodegas.crear"),
        ("actualizar_bodega", "bodegas.editar"),
        ("eliminar_bodega", "bodegas.eliminar"),
    ]),
    ("unidadesMedidas.py", [
        ("listar_unidades", "unidades_medida.leer"),
        ("obtener_unidad", "unidades_medida.leer"),
        ("crear_unidad", "unidades_medida.crear"),
        ("actualizar_unidad", "unidades_medida.editar"),
        ("eliminar_unidad", "unidades_medida.eliminar"),
    ]),
    ("tipo_zona.py", [
        ("listar_tipos_zona", "tipos_zona.leer"),
        ("obtener_tipo_zona", "tipos_zona.leer"),
        ("crear_tipo_zona", "tipos_zona.crear"),
        ("actualizar_tipo_zona", "tipos_zona.editar"),
        ("eliminar_tipo_zona", "tipos_zona.eliminar"),
    ]),
    ("zona_bodega.py", [
        ("listar_zonas_bodega", "zonas_bodega.leer"),
        ("obtener_zona_bodega", "zonas_bodega.leer"),
        ("crear_zona_bodega", "zonas_bodega.crear"),
        ("actualizar_zona_bodega", "zonas_bodega.editar"),
        ("eliminar_zona_bodega", "zonas_bodega.eliminar"),
    ]),
    ("tipo_producto.py", [
        ("listar_tipos_producto", "tipos_producto.leer"),
        ("obtener_tipo_producto", "tipos_producto.leer"),
        ("crear_tipo_producto", "tipos_producto.crear"),
        ("actualizar_tipo_producto", "tipos_producto.editar"),
        ("eliminar_tipo_producto", "tipos_producto.eliminar"),
    ]),
    ("inventario.py", [
        ("listar_stock", "inventario.leer"),
        ("listar_movimientos", "inventario.leer"),
        ("recepcionar", "inventario.recepcionar"),
        ("trasladar", "inventario.trasladar"),
        ("despachar", "inventario.despachar"),
        ("obtener_config_bodega", "inventario.leer"),
        ("actualizar_config_bodega", "inventario.configurar"),
    ]),
    ("producto_presentacion.py", [
        ("listar_presentaciones", "producto_presentacion.leer"),
        ("crear_presentacion", "producto_presentacion.crear"),
        ("actualizar_presentacion", "producto_presentacion.editar"),
        ("eliminar_presentacion", "producto_presentacion.eliminar"),
        ("calcular_descuento_inventario", "producto_presentacion.leer"),
    ]),
    ("usuarios.py", [
        ("listar_usuarios", "usuarios.leer"),
        ("obtener_usuario", "usuarios.leer"),
        ("crear_usuario", "usuarios.crear"),
        ("actualizar_usuario", "usuarios.editar"),
        ("eliminar_usuario", "usuarios.eliminar"),
        ("reactivar_usuario", "usuarios.editar"),
    ]),
    ("cargos.py", [
        ("listar_cargos", "cargos.leer"),
        ("obtener_cargo", "cargos.leer"),
        ("crear_cargo", "cargos.crear"),
        ("actualizar_cargo", "cargos.editar"),
        ("eliminar_cargo", "cargos.eliminar"),
    ]),
    ("roles.py", [
        ("listar_roles", "roles.leer"),
        ("obtener_rol", "roles.leer"),
        ("crear_rol", "roles.crear"),
        ("actualizar_rol", "roles.editar"),
        ("eliminar_rol", "roles.eliminar"),
    ]),
    ("permisos.py", [
        ("listar_permisos", "permisos.leer"),
        ("obtener_permiso", "permisos.leer"),
        ("crear_permiso", "permisos.crear"),
        ("actualizar_permiso", "permisos.editar"),
        ("eliminar_permiso", "permisos.eliminar"),
    ]),
    ("empresas.py", [
        ("listar_empresas", "empresas.leer"),
        ("obtener_empresa", "empresas.leer"),
        ("crear_empresa", "empresas.crear"),
        ("actualizar_empresa", "empresas.editar"),
        ("eliminar_empresa", "empresas.eliminar"),
    ]),
    ("rol_permiso.py", [
        ("listar_permisos_rol", "roles.leer"),
        ("sincronizar_permisos_rol", "roles.editar"),
    ]),
    ("permiso_cargo.py", [
        ("listar_permisos_cargo", "roles.leer"),
        ("crear_permiso_cargo", "roles.editar"),
        ("actualizar_permiso_cargo", "roles.editar"),
        ("eliminar_permiso_cargo", "roles.editar"),
        ("listar_roles_cargo", "roles.leer"),
        ("sincronizar_roles_cargo", "roles.editar"),
    ]),
]


def ensure_imports(content: str) -> str:
    if "requiere_permiso" not in content:
        content = content.replace(
            "from app.api.v1.dependencies import obtener_usuario_autenticado",
            "from app.api.v1.dependencies import obtener_usuario_autenticado, requiere_permiso",
        )
        if "requiere_permiso" not in content:
            content = content.replace(
                "from app.api.v1.dependencies import obtener_usuario_autenticado, es_super_admin",
                "from app.api.v1.dependencies import obtener_usuario_autenticado, es_super_admin, requiere_permiso",
            )
    if "contexto_requiere_permiso" not in content and "obtener_contexto_empresa" in content:
        content = content.replace(
            "obtener_contexto_empresa, resolver_empresa_creacion",
            "obtener_contexto_empresa, resolver_empresa_creacion, contexto_requiere_permiso",
        )
        if "contexto_requiere_permiso" not in content:
            content = content.replace(
                "obtener_contexto_empresa",
                "obtener_contexto_empresa, contexto_requiere_permiso",
                1,
            )
    return content


def patch_function(content: str, func_name: str, permiso: str) -> str:
    pattern = rf"(async def {func_name}\([^)]*?\))"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return content

    start = match.end()
    # Already patched
    if f'requiere_permiso("{permiso}")' in content[match.start() : match.start() + 800]:
        return content

    ctx_line = f'    _perm: dict = Depends(requiere_permiso("{permiso}")),\n'
    if "ctx: ContextoEmpresa = Depends(obtener_contexto_empresa)" in content[start : start + 600]:
        content = content.replace(
            "ctx: ContextoEmpresa = Depends(obtener_contexto_empresa)",
            f'ctx: ContextoEmpresa = Depends(contexto_requiere_permiso("{permiso}"))',
            1,
        )
        return content

    if "usuario_autenticado: dict = Depends(obtener_usuario_autenticado)" in content[start : start + 600]:
        content = content.replace(
            "usuario_autenticado: dict = Depends(obtener_usuario_autenticado)",
            f'usuario_autenticado: dict = Depends(requiere_permiso("{permiso}"))',
            1,
        )
        return content

    # Insert after opening paren block of function params
    insert_at = content.find("):", start)
    if insert_at == -1:
        return content
    # find last param line before ):
    chunk = content[start:insert_at]
    if chunk.strip() and not chunk.rstrip().endswith(","):
        ctx_line = ",\n" + ctx_line
    else:
        ctx_line = "\n" + ctx_line
    return content[:insert_at] + ctx_line + content[insert_at:]


def main() -> None:
    for filename, funcs in RULES:
        path = ENDPOINTS / filename
        if not path.exists():
            print(f"SKIP {filename}")
            continue
        content = path.read_text(encoding="utf-8")
        content = ensure_imports(content)
        for func_name, permiso in funcs:
            content = patch_function(content, func_name, permiso)
        path.write_text(content, encoding="utf-8")
        print(f"OK {filename}")


if __name__ == "__main__":
    main()
