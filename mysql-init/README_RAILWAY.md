# Migraciones MySQL en Railway

## Problema habitual

Si pegaste SQL en la consola de Railway y "no funcionó", suele ser porque:

1. **`01_setup.sql` o `03_rbac_hierarchy.sql` en BD con datos** → error en la primera sentencia y el resto no corre.
2. **`06` / `07` re-ejecutados** → `Duplicate column name` y se detiene.
3. **`09` con usuario id=1 fijo** → en Railway tu usuario puede tener otro id o email.
4. **Orden incorrecto** → falta tabla `permiso` o `usuario_rol` antes del seed.
5. **Consola Railway Query** añade `LIMIT 100` a los SELECT y rompe bloques `SET @var = (SELECT ...)`. Usa los bloques numerados en `06` y `07`, o el script Python.

## Solución recomendada

Desde la raíz del repo, con Railway CLI:

```bash
railway service link MySQL
railway run python scripts/apply_railway_migrations.py
```

> **Importante:** el servicio enlazado debe ser **MySQL**, no `wms_esp`. Si tienes `.env` local con `DATABASE_URL=localhost`, el script usa `MYSQL_PUBLIC_URL` de Railway y **no** tu MySQL local. Al terminar debe mostrar algo como `viaduct.proxy.rlwy.net:.../railway`, no `localhost/wms_esp`.

Con otro email de superadmin:

```bash
railway run python scripts/apply_railway_migrations.py --email tu@email.com
```

Solo ver estado (sin cambios):

```bash
railway run python scripts/apply_railway_migrations.py --diagnose
```

## Orden de archivos (BD ya existente)

| # | Archivo | Qué hace |
|---|---------|----------|
| 1 | `04_rbac_missing_tables.sql` | Crea `permiso`, `rol_permiso` |
| 2 | `05_rbac_seed_empresa_1.sql` | Permisos y rol Administrador empresa 1 |
| 3 | `06_multiempresa.sql` | `es_empresa_maestra`, `empresa_administrada` |
| 4 | `07_producto_tipo_presentacion.sql` | Tipos/presentaciones + permisos (bloques simples, sin PREPARE) |
| 5 | `08_usuario_rol.sql` | Tabla `usuario_rol` + roles operativos |
| 6 | `10_provision_rbac_empresas.sql` | Copia RBAC a otras empresas (bloques 0–6) |
| 7 | `09_grant_superadmin_usuario_1.sql` | Superadmin por email (bloques 1–10) |
| 8 | `12_inventario_operativo.sql` | Stock por zona, movimientos, config bodega, permisos `inventario.*` |
| 9 | `13_fix_permiso_inventario_codigos.sql` | Desactiva alias `recepcion.*` / `reportes.*` y asegura `inventario.*` |
| 10 | `14_auth_security.sql` | Seguridad login (intentos fallidos, bloqueos, reset password) |
| 11 | `17_presentacion_codigo_barras.sql` | Código de barras por presentación (escaneo caja/display) |
| 12 | `18_serie_producto.sql` | Inventario serializado (`producto.serializado`, `serie_producto`) |

**No usar** en Railway con datos: `01_setup.sql`, `03_rbac_hierarchy.sql`, `schema_completo.sql` (recrea todo desde cero).

Solo un archivo:

```bash
railway run python scripts/apply_railway_migrations.py --file 12_inventario_operativo.sql
```

## Después de migrar

1. Cierra sesión en la app web.
2. Vuelve a entrar (JWT con permisos nuevos).
3. En `/asignar-permisos`, elige empresa concreta (no "Todas").
