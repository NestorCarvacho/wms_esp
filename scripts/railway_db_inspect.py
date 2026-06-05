#!/usr/bin/env python3
"""Inspección rápida: qué BD usa DATABASE_URL y qué tablas inventario existen."""
from __future__ import annotations

import os
import sys
from pathlib import Path

import pymysql
from dotenv import load_dotenv
from sqlalchemy.engine import make_url

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.apply_railway_migrations import connect, resolve_database_url  # noqa: E402


def main() -> None:
    raw = resolve_database_url()
    url = make_url(raw)
    print("=== Conexión DATABASE_URL ===")
    print(f"  host: {url.host}")
    print(f"  port: {url.port}")
    print(f"  user: {url.username}")
    print(f"  database: {url.database}")

    conn = connect()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT DATABASE()")
            print(f"  DATABASE() activa: {cur.fetchone()[0]}")

            cur.execute("SHOW DATABASES")
            print("\n=== Bases de datos en el servidor ===")
            for (db,) in cur.fetchall():
                print(f"  - {db}")

            for table in ("stock_zona", "movimiento_inventario", "bodega_config", "permiso"):
                cur.execute(
                    """
                    SELECT TABLE_SCHEMA, TABLE_NAME
                    FROM information_schema.TABLES
                    WHERE TABLE_NAME = %s
                    ORDER BY TABLE_SCHEMA
                    """,
                    (table,),
                )
                rows = cur.fetchall()
                print(f"\n=== Tabla `{table}` ===")
                if not rows:
                    print("  (no existe en ninguna BD)")
                for schema, name in rows:
                    print(f"  {schema}.{name}")

            cur.execute(
                """
                SELECT empresa_id, codigo, activo
                FROM permiso
                WHERE codigo LIKE 'inventario.%'
                ORDER BY empresa_id, codigo
                """
            )
            print("\n=== permiso inventario.* (BD activa) ===")
            rows = cur.fetchall()
            if not rows:
                print("  (ninguno)")
            for row in rows:
                print(f"  empresa={row[0]} codigo={row[1]} activo={row[2]}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
