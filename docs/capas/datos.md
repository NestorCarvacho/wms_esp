# Capa de Acceso a Datos (Adaptadores / Repositorios)

## Responsabilidades

- Ejecutar consultas SQL en `app/modules/<contexto>/infrastructure/`.
- Implementar puertos definidos en `domain/ports.py`.
- Mapear registros ORM a entidades de dominio cuando aplique (`orm_mappers.py`).

## Reglas de implementación

- **Filtro multi-tenant:** incluir `empresa_id` en lecturas y escrituras según el contexto del handler.
- **ORM centralizado:** modelos en `app/infrastructure/models/`; los adaptadores de módulo los importan solo en infrastructure.
- **Compatibilidad:** re-exports en `app/infrastructure/repositories/` para código legacy que aún no migró.
- **Listados:** reutilizar `listado_helpers.py` (`filtro_empresa`, `condicion_buscar`, `aplicar_orden`).

## Prohibiciones

- Los adaptadores no validan permisos HTTP (eso es responsabilidad del endpoint + JWT).
- `domain/` y `application/` no importan SQLAlchemy.
