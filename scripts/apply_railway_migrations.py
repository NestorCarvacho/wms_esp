#!/usr/bin/env python3
"""
Aplica migraciones SQL en Railway (o cualquier MySQL vía DATABASE_URL).

Uso local:
  set DATABASE_URL=mysql://user:pass@host:port/railway
  python scripts/apply_railway_migrations.py

Uso Railway (recomendado):
  railway service link MySQL
  railway run python scripts/apply_railway_migrations.py

Opciones:
  --diagnose   Solo muestra estado de tablas/columnas (sin cambios)
  --file FILE  Ejecuta un solo archivo SQL
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import pymysql
from dotenv import load_dotenv
from sqlalchemy.engine import make_url

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS_DIR = ROOT / "mysql-init"

# Orden para BD ya existente en Railway (NO incluye 01_setup ni 02_altern_tables).
MIGRATION_FILES = [
    "04_rbac_missing_tables.sql",
    "05_rbac_seed_empresa_1.sql",
    "06_multiempresa.sql",
    "07_producto_tipo_presentacion.sql",
    "08_usuario_rol.sql",
    "10_provision_rbac_empresas.sql",
    "09_grant_superadmin_usuario_1.sql",
    "12_inventario_operativo.sql",
    "13_fix_permiso_inventario_codigos.sql",
    "14_auth_security.sql",
    "17_presentacion_codigo_barras.sql",
    "18_serie_producto.sql",
    "19_locale_currency.sql",
    "20_notificacion.sql",
    "21_producto_stock_minimo.sql",
]

# Errores MySQL benignos al re-ejecutar scripts idempotentes.
BENIGN_ERROR_FRAGMENTS = (
    "duplicate column",
    "duplicate key name",
    "duplicate foreign key",
    "already exists",
    "can't drop",
    "check that column/key exists",
    "duplicate entry",
    "errno: 1061",
    "errno: 1060",
    "errno: 1826",
)


def normalize_database_url(raw: str) -> str:
    url = raw.strip()
    if url.startswith("mysql+aiomysql://"):
        return "mysql://" + url[len("mysql+aiomysql://") :]
    return url


def _is_local_host(host: str | None) -> bool:
    return (host or "localhost") in ("localhost", "127.0.0.1")


def _build_public_mysql_url(
    *,
    user: str,
    password: str,
    database: str,
    host: str,
    port: int,
) -> str:
    from sqlalchemy.engine import URL

    return str(
        URL.create(
            "mysql",
            username=user,
            password=password,
            host=host,
            port=port,
            database=database,
        )
    )


def resolve_database_url() -> str:
    """
    Prioridad:
    1. MYSQL_PUBLIC_URL (railway service link MySQL + railway run desde tu PC)
    2. DATABASE_URL remota (no localhost / no *.railway.internal sin proxy)
    3. Proxy TCP público + credenciales Railway
    4. .env local (desarrollo)
    """
    public = os.getenv("MYSQL_PUBLIC_URL", "").strip()
    if public:
        return normalize_database_url(public)

    db_url = os.getenv("DATABASE_URL", "").strip()
    if db_url:
        parsed = make_url(normalize_database_url(db_url))
        host = parsed.host or "localhost"
        if not _is_local_host(host) and "railway.internal" not in host:
            return normalize_database_url(db_url)

        proxy_host = os.getenv("RAILWAY_TCP_PROXY_DOMAIN") or os.getenv("MYSQL_TCP_PROXY_HOST")
        proxy_port = os.getenv("RAILWAY_TCP_PROXY_PORT") or os.getenv("MYSQL_TCP_PROXY_PORT")
        user = parsed.username or os.getenv("MYSQLUSER") or os.getenv("MYSQL_USER")
        password = parsed.password or os.getenv("MYSQLPASSWORD") or os.getenv("MYSQL_PASSWORD") or ""
        database = parsed.database or os.getenv("MYSQLDATABASE") or os.getenv("MYSQL_DATABASE") or "railway"
        if proxy_host and proxy_port and user:
            return _build_public_mysql_url(
                user=user,
                password=password,
                database=database,
                host=proxy_host,
                port=int(proxy_port),
            )

    proxy_host = os.getenv("RAILWAY_TCP_PROXY_DOMAIN") or os.getenv("MYSQL_TCP_PROXY_HOST")
    proxy_port = os.getenv("RAILWAY_TCP_PROXY_PORT") or os.getenv("MYSQL_TCP_PROXY_PORT")
    user = os.getenv("MYSQLUSER") or os.getenv("MYSQL_USER")
    password = os.getenv("MYSQLPASSWORD") or os.getenv("MYSQL_PASSWORD") or ""
    database = os.getenv("MYSQLDATABASE") or os.getenv("MYSQL_DATABASE") or "railway"
    if proxy_host and proxy_port and user:
        return _build_public_mysql_url(
            user=user,
            password=password,
            database=database,
            host=proxy_host,
            port=int(proxy_port),
        )

    load_dotenv(ROOT / ".env")
    local = os.getenv("DATABASE_URL", "").strip()
    if local:
        parsed = make_url(normalize_database_url(local))
        if os.getenv("RAILWAY_ENVIRONMENT") and _is_local_host(parsed.host):
            print(
                "AVISO: railway run inyectó RAILWAY_* pero se usará DATABASE_URL local "
                f"({parsed.host}/{parsed.database}). Enlaza MySQL: railway service link MySQL",
                file=sys.stderr,
            )
        return normalize_database_url(local)

    print("ERROR: No hay URL de MySQL.", file=sys.stderr)
    print("  railway service link MySQL", file=sys.stderr)
    print("  railway run python scripts/apply_railway_migrations.py", file=sys.stderr)
    sys.exit(1)


def connect():
    raw = resolve_database_url()
    url = make_url(raw)
    return pymysql.connect(
        host=url.host or "localhost",
        port=url.port or 3306,
        user=url.username,
        password=url.password or "",
        database=url.database,
        charset="utf8mb4",
        autocommit=True,
        client_flag=pymysql.constants.CLIENT.MULTI_STATEMENTS,
    )


def is_benign_error(message: str) -> bool:
    lower = message.lower()
    return any(fragment in lower for fragment in BENIGN_ERROR_FRAGMENTS)


def split_sql_statements(sql: str) -> list[str]:
    """Divide SQL respetando bloques PREPARE/EXECUTE."""
    statements: list[str] = []
    buffer: list[str] = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--"):
            continue
        buffer.append(line)
        if stripped.endswith(";"):
            chunk = "\n".join(buffer).strip()
            if chunk and chunk != ";":
                statements.append(chunk)
            buffer = []
    tail = "\n".join(buffer).strip()
    if tail:
        statements.append(tail)
    return statements


def execute_file(cursor, path: Path) -> tuple[int, list[str]]:
    sql = path.read_text(encoding="utf-8")
    statements = split_sql_statements(sql)
    applied = 0
    warnings: list[str] = []

    for stmt in statements:
        if not stmt.strip():
            continue
        try:
            cursor.execute(stmt)
            while cursor.nextset():
                pass
            applied += 1
        except pymysql.MySQLError as exc:
            msg = str(exc)
            if is_benign_error(msg):
                warnings.append(f"  [omitido] {msg}")
                continue
            raise RuntimeError(f"Error en {path.name}:\n{stmt[:200]}...\n→ {msg}") from exc

    return applied, warnings


def fix_rol_drop_cargo_id(cursor) -> list[str]:
    """Elimina columna legacy cargo_id de rol (esquema pre-RBAC)."""
    logs: list[str] = []
    cursor.execute(
        """
        SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rol' AND COLUMN_NAME = 'cargo_id'
        """
    )
    if not cursor.fetchone()[0]:
        logs.append("  rol.cargo_id: ya eliminada")
        return logs

    cursor.execute(
        """
        SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rol'
          AND COLUMN_NAME = 'cargo_id' AND REFERENCED_TABLE_NAME IS NOT NULL
        LIMIT 1
        """
    )
    fk = cursor.fetchone()
    if fk:
        cursor.execute(f"ALTER TABLE rol DROP FOREIGN KEY `{fk[0]}`")
        logs.append(f"  FK eliminada: {fk[0]}")

    for stmt in (
        "ALTER TABLE rol DROP INDEX uk_rol_cargo_empresa",
        "ALTER TABLE rol DROP COLUMN cargo_id",
        "ALTER TABLE rol ADD UNIQUE KEY uk_rol_empresa (nombre, empresa_id)",
    ):
        try:
            cursor.execute(stmt)
            logs.append(f"  OK: {stmt[:60]}...")
        except pymysql.MySQLError as exc:
            if is_benign_error(str(exc)):
                logs.append(f"  [omitido] {exc}")
            else:
                raise

    logs.append("  rol.cargo_id: eliminada")
    return logs


def run_diagnostics(cursor) -> None:
    checks = [
        ("Tabla permiso", "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='permiso'"),
        ("Tabla usuario_rol", "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='usuario_rol'"),
        ("Columna empresa.es_empresa_maestra", "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='empresa' AND COLUMN_NAME='es_empresa_maestra'"),
        ("Columna rol.cargo_id (legacy)", "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='rol' AND COLUMN_NAME='cargo_id'"),
        ("Tabla stock_zona", "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='stock_zona'"),
        ("Tabla movimiento_inventario", "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='movimiento_inventario'"),
        ("Tabla bodega_config", "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='bodega_config'"),
        ("Permisos inventario.* activos", "SELECT COUNT(*) FROM permiso WHERE activo=1 AND codigo LIKE 'inventario.%'"),
        ("Columna usuario.intentos_fallidos", "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='usuario' AND COLUMN_NAME='intentos_fallidos'"),
        ("Tabla password_reset_token", "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='password_reset_token'"),
        ("Columna producto_presentacion.codigo_barras", "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='producto_presentacion' AND COLUMN_NAME='codigo_barras'"),
        ("Columna producto.serializado", "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='producto' AND COLUMN_NAME='serializado'"),
        ("Tabla serie_producto", "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='serie_producto'"),
        ("Columna movimiento_inventario.serie_id", "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='movimiento_inventario' AND COLUMN_NAME='serie_id'"),
        ("Columna empresa.locale", "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='empresa' AND COLUMN_NAME='locale'"),
        ("Columna empresa.timezone", "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='empresa' AND COLUMN_NAME='timezone'"),
        ("Columna empresa.moneda_codigo", "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='empresa' AND COLUMN_NAME='moneda_codigo'"),
        ("Tabla moneda", "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='moneda'"),
        ("Tabla tipo_cambio_historico", "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='tipo_cambio_historico'"),
        ("Permisos empresa 1", "SELECT COUNT(*) FROM permiso WHERE empresa_id=1 AND activo=1"),
        ("Roles empresa 1", "SELECT COUNT(*) FROM rol WHERE empresa_id=1 AND activo=1"),
        ("Usuarios con usuario_rol", "SELECT COUNT(DISTINCT usuario_id) FROM usuario_rol WHERE activo=1"),
    ]
    print("\n=== Diagnóstico BD ===")
    for label, query in checks:
        try:
            cursor.execute(query)
            row = cursor.fetchone()
            value = row[0] if row else "?"
            print(f"  {label}: {value}")
        except pymysql.MySQLError as exc:
            print(f"  {label}: ERROR ({exc})")

    try:
        cursor.execute(
            """
            SELECT u.id, u.email, u.empresa_id,
                   COALESCE(e.es_empresa_maestra, 0) AS es_maestra,
                   COUNT(DISTINCT p.codigo) AS permisos
            FROM usuario u
            LEFT JOIN empresa e ON e.id = u.empresa_id
            LEFT JOIN usuario_rol ur ON ur.usuario_id = u.id AND ur.activo = 1
            LEFT JOIN rol_permiso rp ON rp.rol_id = ur.rol_id AND rp.activo = 1
            LEFT JOIN permiso p ON p.id = rp.permiso_id AND p.activo = 1
            GROUP BY u.id, u.email, u.empresa_id, e.es_empresa_maestra
            ORDER BY u.id
            LIMIT 10
            """
        )
        rows = cursor.fetchall()
        print("\n=== Usuarios (permisos vía usuario_rol) ===")
        if not rows:
            print("  (sin usuarios o sin tabla usuario_rol)")
        for row in rows:
            print(f"  id={row[0]} email={row[1]} empresa={row[2]} maestra={row[3]} permisos={row[4]}")
    except pymysql.MySQLError as exc:
        print(f"\n  No se pudo listar usuarios: {exc}")

    try:
        cursor.execute(
            """
            SELECT e.id, COALESCE(e.razon_social, e.nombre_fantasia, e.codigo) AS nombre, COUNT(p.id) AS permisos
            FROM empresa e
            LEFT JOIN permiso p ON p.empresa_id = e.id AND p.activo = 1
            GROUP BY e.id, e.razon_social, e.nombre_fantasia, e.codigo
            ORDER BY e.id
            """
        )
        print("\n=== Permisos por empresa ===")
        for row in cursor.fetchall():
            print(f"  empresa {row[0]} ({row[1]}): {row[2]} permisos")
    except pymysql.MySQLError as exc:
        print(f"\n  No se pudo listar empresas: {exc}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Migraciones SQL para Railway MySQL")
    parser.add_argument("--diagnose", action="store_true", help="Solo diagnóstico, sin aplicar cambios")
    parser.add_argument("--file", help="Ejecutar un solo archivo de mysql-init/")
    parser.add_argument(
        "--email",
        default=os.getenv("SUPERADMIN_EMAIL", "nestor.carvacho@wms.com"),
        help="Email del superadmin para 09_grant_superadmin (variable SUPERADMIN_EMAIL)",
    )
    args = parser.parse_args()

    conn = connect()
    try:
        with conn.cursor() as cursor:
            if args.diagnose:
                run_diagnostics(cursor)
                return

            files = [MIGRATIONS_DIR / args.file] if args.file else [MIGRATIONS_DIR / f for f in MIGRATION_FILES]

            target = make_url(resolve_database_url())
            print(f"Conectado a: {target.host}:{target.port}/{target.database}")

            print("\n>> fix_rol_drop_cargo_id")
            for line in fix_rol_drop_cargo_id(cursor):
                print(line)

            for path in files:
                if not path.exists():
                    raise FileNotFoundError(path)

                run_path = path
                if path.name.startswith("09_grant_superadmin"):
                    cursor.execute(
                        "SELECT id FROM usuario WHERE email = %s LIMIT 1",
                        (args.email,),
                    )
                    if not cursor.fetchone():
                        print(f"  AVISO: Usuario '{args.email}' no existe en BD. Saltando 09.")
                        continue

                    content = path.read_text(encoding="utf-8")
                    content = content.replace("nestor.carvacho@wms.com", args.email)
                    run_path = path.with_name(path.stem + ".tmp.sql")
                    run_path.write_text(content, encoding="utf-8")

                print(f"\n>> {run_path.name}")
                applied, warnings = execute_file(cursor, run_path)
                print(f"  {applied} sentencia(s) OK")
                for w in warnings[:5]:
                    print(w)
                if len(warnings) > 5:
                    print(f"  ... y {len(warnings) - 5} aviso(s) más")

                if run_path != path and run_path.exists():
                    run_path.unlink()

            run_diagnostics(cursor)
            print("\nOK Migraciones aplicadas. Cierra sesion en la app y vuelve a entrar para refrescar el JWT.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
