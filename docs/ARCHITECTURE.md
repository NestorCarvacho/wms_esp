# Arquitectura WMS ESP

Monolito modular hexagonal (Fase 1). Ver ADR 001–006.

## Bounded contexts

| Módulo | Ruta | Responsabilidad |
|--------|------|-----------------|
| `iam` | `app/modules/iam/` | Auth, RBAC, usuarios |
| `tenant` | `app/modules/tenant/` | Empresas multi-tenant |
| `catalog` | `app/modules/catalog/` | Productos, tipos, unidades |
| `warehouse` | `app/modules/warehouse/` | Bodegas, zonas |
| `inventory` | `app/modules/inventory/` | Stock, movimientos, operaciones |

## Flujo HTTP actual

```
app/api/v1/endpoints/*  →  app/domain/services/* (fachada)  →  handlers  →  puertos  →  adaptadores  →  CRUD legacy
```

**Deuda consciente:** routers centralizados en `app/api/`; fachadas Strangler en `app/domain/services/`.

## Endpoints legacy (sin módulo)

| Endpoint | Estado |
|----------|--------|
| `geografia.py` | ORM directo |
| `perfil_usuario.py` | CRUD directo |
| `producto_presentacion.py` | Servicio legacy |
| `serie_producto.py` | Servicio legacy |
| `productos.py` (import/consulta) | Mixto |

## Composition root

- `app/bootstrap/container.py` — IAM + inventario
- `app/bootstrap/{catalog,warehouse,tenant}_container.py` — resto

## CI

- `lint-imports` — aislamiento domain/application
- `pytest tests/`
- `frontend npm run build`

## Plan de normalización

Ver `docs/PLAN_NORMALIZACION.md`.
